import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface AIResponse {
  content: string;
  sources: string[];
  followUps: string[];
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  async generateResponse(userInput: string, uploadedFiles: File[] = [], userProfile?: any): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(userProfile);
      const fullPrompt = this.buildFullPrompt(systemPrompt, userInput, uploadedFiles, userProfile);

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();

      const sources = this.extractAndGenerateSources(userInput, content, uploadedFiles);
      const followUps = this.generateContextualFollowUps(userInput, content, userProfile);

      return {
        content,
        sources,
        followUps
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  private buildSystemPrompt(userProfile?: any): string {
    const basePersona = `You are an advanced and friendly AI study buddy designed to help students of all levels. Your goal is to make learning engaging, efficient, and personalized.

**Your Core Functions:**
1. **Explain Concepts:** Break down complex topics into easy-to-understand explanations
2. **Generate Practice Questions:** Create quizzes, flashcards, or problem sets
3. **Provide Feedback:** Evaluate answers and offer constructive criticism
4. **Suggest Study Strategies:** Offer tips on time management, memorization, and effective learning
5. **Summarize Information:** Condense long texts or lectures into key points
6. **Maintain an Encouraging Tone:** Always be positive, patient, and supportive
7. **Personalize Learning:** Adapt to the user's learning style and subject interests

**Your Personality & Tone:**
- **Friendly & Approachable:** Use natural, conversational language
- **Knowledgeable & Clear:** Deliver accurate information concisely
- **Patient & Encouraging:** Never condescending. Celebrate progress
- **Proactive:** Anticipate learning needs and suggest next steps
- **Slightly Enthusiastic:** Show genuine interest in the user's learning journey

**Interaction Guidelines:**
- Ask clarifying questions if requests are unclear
- Confirm understanding with "Does that make sense?" or "Would you like me to explain it differently?"
- Suggest visual aids or diagrams when helpful (describe them clearly)
- Keep initial responses concise, then offer to elaborate
- Focus on active learning - encourage application of knowledge
- Use **bold formatting** for key terms, concepts, and important points

**When responding, you should:**
1. Directly address their query
2. Be structured logically and clearly
3. Maintain your friendly and encouraging tone
4. Offer a clear next step or related suggestion

**Response Format:**
- Use **bold text** for emphasis, key terms, and important concepts
- Structure responses with clear headings when appropriate
- Use bullet points for lists
- Make responses visually scannable and well-organized`;

    // Add personalization if user profile is available
    if (userProfile) {
      const personalization = `

**User Profile Context:**
- Name: ${userProfile.display_name}
- Academic Level: ${userProfile.academic_level}
- Preferred Difficulty: ${userProfile.preferred_difficulty}
- Subjects of Interest: ${userProfile.subjects_of_interest.join(', ')}
- Learning Goals: ${userProfile.learning_goals.join(', ')}

Adapt your responses to match their academic level and preferred difficulty. When relevant, reference their subjects of interest and learning goals to make the content more engaging and personalized.`;

      return basePersona + personalization;
    }

    return basePersona;
  }

  private buildFullPrompt(systemPrompt: string, userInput: string, uploadedFiles: File[], userProfile?: any): string {
    let prompt = `${systemPrompt}

Student Question: ${userInput}`;

    // Add file context if available
    if (uploadedFiles && uploadedFiles.length > 0) {
      prompt += `

Context: The student has uploaded ${uploadedFiles.length} file(s): ${uploadedFiles.map(f => f.name).join(', ')}. Please acknowledge these materials in your response and reference them when relevant.`;
    }

    // Add personalized context
    if (userProfile) {
      prompt += `

Remember to tailor your response to ${userProfile.display_name}'s ${userProfile.academic_level} level and ${userProfile.preferred_difficulty} difficulty preference. If the question relates to their interests (${userProfile.subjects_of_interest.join(', ')}), make connections to help them achieve their learning goals.`;
    }

    prompt += `

Please provide a comprehensive, educational response that:
- Uses **bold formatting** for key terms and important concepts
- Is structured clearly and logically
- Maintains an encouraging and friendly tone
- Includes specific examples when helpful
- Suggests next steps for continued learning
- Confirms understanding when appropriate`;

    return prompt;
  }

  private extractAndGenerateSources(userInput: string, content: string, uploadedFiles: File[] = []): string[] {
    const lowerInput = userInput.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    const sources: string[] = [];

    // Mathematics and Statistics
    if (this.isSubject(lowerInput, lowerContent, ['math', 'calculus', 'algebra', 'statistics', 'geometry', 'trigonometry'])) {
      const mathSources = [
        'Stewart, J. (2020). Calculus: Early Transcendentals, 9th Edition',
        'Spivak, M. (2008). Calculus, 4th Edition',
        'Khan Academy: Mathematics',
        'MIT OpenCourseWare: Single Variable Calculus',
        'Wolfram MathWorld',
        'American Mathematical Society Publications'
      ];
      sources.push(...this.selectRandomSources(mathSources, 2));
    }

    // Literature and English
    if (this.isSubject(lowerInput, lowerContent, ['literature', 'shakespeare', 'poetry', 'novel', 'drama', 'english'])) {
      const literatureSources = [
        'Norton Anthology of English Literature',
        'The Cambridge History of English Literature',
        'MLA International Bibliography',
        'Oxford English Dictionary',
        'Project Gutenberg Digital Library',
        'JSTOR Literature Collection'
      ];
      sources.push(...this.selectRandomSources(literatureSources, 2));
    }

    // Sciences (Biology, Chemistry, Physics)
    if (this.isSubject(lowerInput, lowerContent, ['biology', 'chemistry', 'physics', 'science', 'molecular', 'atomic', 'cell'])) {
      const scienceSources = [
        'Campbell, N. A. (2020). Campbell Biology, 12th Edition',
        'Zumdahl, S. S. (2019). Chemistry, 10th Edition',
        'Halliday, D. (2018). Fundamentals of Physics, 11th Edition',
        'Nature Journal Publications',
        'Science Magazine',
        'PubMed Central Database'
      ];
      sources.push(...this.selectRandomSources(scienceSources, 2));
    }

    // History and Social Sciences
    if (this.isSubject(lowerInput, lowerContent, ['history', 'war', 'revolution', 'political', 'social', 'civilization'])) {
      const historySources = [
        'Foner, E. (2019). Give Me Liberty! An American History',
        'The Cambridge Modern History',
        'Oxford History of the World',
        'Smithsonian Institution Archives',
        'Library of Congress Digital Collections',
        'Historical Abstracts Database'
      ];
      sources.push(...this.selectRandomSources(historySources, 2));
    }

    // Computer Science and Technology
    if (this.isSubject(lowerInput, lowerContent, ['programming', 'algorithm', 'computer', 'software', 'coding', 'technology'])) {
      const csSources = [
        'Cormen, T. H. (2009). Introduction to Algorithms, 3rd Edition',
        'Sipser, M. (2012). Introduction to the Theory of Computation',
        'ACM Digital Library',
        'IEEE Computer Society Publications',
        'MIT OpenCourseWare: Computer Science',
        'Stack Overflow Developer Survey'
      ];
      sources.push(...this.selectRandomSources(csSources, 2));
    }

    // Economics and Business
    if (this.isSubject(lowerInput, lowerContent, ['economics', 'business', 'finance', 'market', 'trade', 'economy'])) {
      const economicsSources = [
        'Mankiw, N. G. (2020). Principles of Economics, 8th Edition',
        'Krugman, P. (2018). Economics, 5th Edition',
        'Federal Reserve Economic Data (FRED)',
        'World Bank Open Data',
        'International Monetary Fund Publications',
        'Journal of Economic Literature'
      ];
      sources.push(...this.selectRandomSources(economicsSources, 2));
    }

    // Psychology and Cognitive Science
    if (this.isSubject(lowerInput, lowerContent, ['psychology', 'cognitive', 'behavior', 'mental', 'brain', 'mind'])) {
      const psychSources = [
        'Myers, D. G. (2019). Psychology, 12th Edition',
        'Cognitive Science Society Publications',
        'American Psychological Association (APA)',
        'Journal of Experimental Psychology',
        'Psychological Science Journal',
        'PsycINFO Database'
      ];
      sources.push(...this.selectRandomSources(psychSources, 2));
    }

    // Art and Art History
    if (this.isSubject(lowerInput, lowerContent, ['art', 'painting', 'sculpture', 'renaissance', 'museum', 'artist'])) {
      const artSources = [
        'Gardner, H. (2019). Gardner\'s Art through the Ages',
        'Metropolitan Museum of Art Collection',
        'Oxford Art Online',
        'Art Index Retrospective',
        'Museum of Modern Art (MoMA) Publications',
        'Getty Research Institute'
      ];
      sources.push(...this.selectRandomSources(artSources, 2));
    }

    // Philosophy
    if (this.isSubject(lowerInput, lowerContent, ['philosophy', 'ethics', 'logic', 'metaphysics', 'epistemology'])) {
      const philosophySources = [
        'Stanford Encyclopedia of Philosophy',
        'Blackwell Companion to Philosophy',
        'Oxford Handbook of Philosophy',
        'Philosophical Review',
        'Journal of Philosophy',
        'Internet Encyclopedia of Philosophy'
      ];
      sources.push(...this.selectRandomSources(philosophySources, 2));
    }

    // If no specific sources found, add general academic sources
    if (sources.length === 0) {
      const generalSources = [
        'Encyclopedia Britannica Academic',
        'Oxford Academic Journals',
        'Cambridge Core',
        'JSTOR Academic Database',
        'Google Scholar',
        'ResearchGate Publications'
      ];
      sources.push(...this.selectRandomSources(generalSources, 2));
    }

    // Add uploaded files as sources if available
    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        sources.push(`Uploaded Document: ${file.name}`);
      });
    }

    return sources.slice(0, 4); // Limit to 4 sources maximum
  }

  private isSubject(input: string, content: string, keywords: string[]): boolean {
    return keywords.some(keyword => 
      input.includes(keyword) || content.includes(keyword)
    );
  }

  private selectRandomSources(sourceArray: string[], count: number): string[] {
    const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private generateContextualFollowUps(userInput: string, content: string, userProfile?: any): string[] {
    const lowerInput = userInput.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    const followUps: string[] = [];

    // Mathematics follow-ups
    if (this.isSubject(lowerInput, lowerContent, ['math', 'calculus', 'algebra', 'equation'])) {
      const mathFollowUps = [
        'Can you show me a step-by-step worked example?',
        'What are the real-world applications of this concept?',
        'How does this relate to other mathematical topics?',
        'What are common mistakes students make with this?',
        'Can you provide practice problems to test my understanding?'
      ];
      followUps.push(...this.selectRandomSources(mathFollowUps, 3));
    }
    
    // Literature follow-ups
    else if (this.isSubject(lowerInput, lowerContent, ['literature', 'shakespeare', 'poetry', 'novel'])) {
      const litFollowUps = [
        'What are the key symbols and their meanings?',
        'How does this work reflect its historical context?',
        'What other works explore similar themes?',
        'How has critical interpretation of this work evolved?',
        'What writing techniques make this work effective?'
      ];
      followUps.push(...this.selectRandomSources(litFollowUps, 3));
    }
    
    // Science follow-ups
    else if (this.isSubject(lowerInput, lowerContent, ['biology', 'chemistry', 'physics', 'science'])) {
      const scienceFollowUps = [
        'Can you explain the underlying mechanism in more detail?',
        'What experiments demonstrate this principle?',
        'How is this concept applied in current research?',
        'What are the practical implications?',
        'How does this connect to other scientific concepts?'
      ];
      followUps.push(...this.selectRandomSources(scienceFollowUps, 3));
    }
    
    // History follow-ups
    else if (this.isSubject(lowerInput, lowerContent, ['history', 'war', 'revolution', 'historical'])) {
      const historyFollowUps = [
        'What were the long-term consequences of this event?',
        'How do different historians interpret this?',
        'What primary sources document this period?',
        'How did this influence later developments?',
        'What were the social and economic factors involved?'
      ];
      followUps.push(...this.selectRandomSources(historyFollowUps, 3));
    }
    
    // Computer Science follow-ups
    else if (this.isSubject(lowerInput, lowerContent, ['programming', 'algorithm', 'computer', 'code'])) {
      const csFollowUps = [
        'Can you show me a code example?',
        'What are the time and space complexities?',
        'How is this implemented in different programming languages?',
        'What are the best practices for this?',
        'What are common debugging strategies?'
      ];
      followUps.push(...this.selectRandomSources(csFollowUps, 3));
    }
    
    // Personalized follow-ups based on user profile
    else if (userProfile) {
      const personalizedFollowUps = [
        `How does this relate to your ${userProfile.subjects_of_interest[0]} studies?`,
        'Would you like me to adjust the difficulty level?',
        'Can you explain this concept back to me in your own words?',
        'What specific part would you like me to elaborate on?',
        'How can we apply this to help achieve your learning goals?'
      ];
      followUps.push(...this.selectRandomSources(personalizedFollowUps, 2));
    }
    
    // Generic educational follow-ups
    if (followUps.length < 3) {
      const genericFollowUps = [
        'Does that make sense? Would you like me to explain it differently?',
        'Can you think of any examples from your own experience?',
        'What questions do you have about this topic?',
        'Would you like me to create some practice questions?',
        'How confident do you feel about this concept now?',
        'What would you like to explore next?'
      ];
      followUps.push(...this.selectRandomSources(genericFollowUps, 3 - followUps.length));
    }

    return followUps.slice(0, 3); // Limit to 3 follow-ups
  }

  async processUploadedFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        resolve(`File uploaded: ${file.name} (${file.type})`);
      }
    });
  }
}

export const geminiService = new GeminiService();