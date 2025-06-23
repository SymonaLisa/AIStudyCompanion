import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Upload, 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink,
  MessageCircle,
  FileText,
  Bookmark,
  History,
  Brain,
  Mic,
  Paperclip,
  AlertCircle,
  X,
  Moon,
  Sun,
  Camera,
  Image as ImageIcon,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import MessageBubble from './MessageBubble';
import SourceModal from './SourceModal';
import ImageUpload from './ImageUpload';
import Navigation from './Navigation';
import { geminiService, AIResponse } from '../services/geminiService';
import { userDataService } from '../services/userDataService';
import { UserProfile } from '../types/user';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
  sources?: string[];
  followUps?: string[];
  rating?: 'up' | 'down' | null;
}

interface ChatInterfaceProps {
  onBack: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  onShowProfile: () => void;
  onSignOut: () => void;
  selectedSubject?: string | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onBack, 
  darkMode, 
  onToggleDarkMode,
  user,
  userProfile,
  onShowProfile,
  onSignOut,
  selectedSubject
}) => {
  const getInitialMessage = () => {
    if (selectedSubject) {
      return userProfile 
        ? `Hello **${userProfile.display_name}**! 🌟 I'm excited to help you learn **${selectedSubject}**! I can assist you with any concepts, problems, or questions you have in this subject.\n\nI'll adapt my explanations to your **${userProfile.preferred_difficulty}** level and help you achieve your learning goals. Feel free to ask questions, upload study materials, or take photos of your notes - I'm here to make learning ${selectedSubject} engaging and fun!\n\nWhat would you like to explore in **${selectedSubject}** today? 📚✨`
        : `Hello! 🌟 I'm your friendly AI study companion, and I'm thrilled to help you learn **${selectedSubject}**! I can assist you with any concepts, problems, or questions you have in this subject.\n\nI love making learning engaging and personalized just for you. Feel free to ask questions, upload study materials, or take photos of your notes. I'm here to break down complex topics, create practice questions, and celebrate your progress every step of the way!\n\nWhat would you like to explore in **${selectedSubject}** today? 📚✨`;
    }
    
    return userProfile 
      ? `Hello **${userProfile.display_name}**! 🌟 I'm your friendly AI study companion, and I'm excited to help you learn! I can assist you with any subject - from ${userProfile.subjects_of_interest.length > 0 ? userProfile.subjects_of_interest.slice(0, 2).join(' and ') : 'mathematics and sciences'} to literature, history, and beyond.\n\nI'll adapt my explanations to your **${userProfile.preferred_difficulty}** level and help you achieve your learning goals. Feel free to ask questions, upload study materials, or take photos of your notes - I'm here to make learning engaging and fun!\n\nWhat would you like to explore today? 📚✨`
      : "Hello! 🌟 I'm your friendly AI study companion, and I'm thrilled to help you learn! I can assist you with any subject - from mathematics and sciences to literature, history, arts, and beyond.\n\nI love making learning engaging and personalized just for you. Feel free to ask questions, upload study materials, or take photos of your notes. I'm here to break down complex topics, create practice questions, and celebrate your progress every step of the way!\n\nWhat would you like to explore today? 📚✨";
  };

  const getInitialFollowUps = () => {
    if (selectedSubject) {
      return [
        `Explain key concepts in ${selectedSubject}`,
        `Create practice questions for ${selectedSubject}`,
        `Help me understand difficult ${selectedSubject} topics`,
        `Show me study strategies for ${selectedSubject}`
      ];
    }
    
    return userProfile?.subjects_of_interest.length > 0 
      ? [
        `Help me understand ${userProfile.subjects_of_interest[0]} concepts`,
        'Create practice questions for my studies',
        'Explain study strategies that work best for me'
      ]
      : [
        "Explain a concept I'm struggling with",
        "Create practice questions for any subject",
        "Help me develop better study strategies",
        "Analyze my uploaded study materials"
      ];
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: getInitialMessage(),
      timestamp: new Date(),
      sources: [
        'Educational Psychology Research',
        'Learning Sciences Best Practices',
        'Academic Study Methods Guide'
      ],
      followUps: getInitialFollowUps()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [extractedTexts, setExtractedTexts] = useState<Array<{text: string, type: string}>>([]);
  const [sessionStartTime] = useState(Date.now());
  const [questionCount, setQuestionCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update initial message when selectedSubject changes
  useEffect(() => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: getInitialMessage(),
      timestamp: new Date(),
      sources: [
        'Educational Psychology Research',
        'Learning Sciences Best Practices',
        'Academic Study Methods Guide'
      ],
      followUps: getInitialFollowUps()
    }]);
  }, [selectedSubject, userProfile]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Include extracted text context if available
      let contextualInput = inputValue;
      if (extractedTexts.length > 0) {
        const contexts = extractedTexts.map(item => `[${item.type}]: ${item.text}`).join('\n\n');
        contextualInput = `${inputValue}\n\nContext from uploaded images:\n${contexts}`;
      }

      // Add subject context if a specific subject was selected
      if (selectedSubject) {
        contextualInput = `Subject Focus: ${selectedSubject}\n\n${contextualInput}`;
      }

      // Pass user profile for personalization
      const response: AIResponse = await geminiService.generateResponse(
        contextualInput, 
        uploadedFiles, 
        userProfile
      );
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
        followUps: response.followUps
      };

      setMessages(prev => [...prev, aiMessage]);
      setQuestionCount(prev => prev + 1);

      // Save question to database and update stats if user is logged in
      if (user) {
        try {
          // Save the question
          await userDataService.saveQuestion({
            user_id: user.id,
            question: inputValue,
            answer: response.content,
            subject: selectedSubject || 'General',
            sources: response.sources,
            is_bookmarked: false
          });

          // Update question count
          await userDataService.incrementQuestionCount(user.id);
        } catch (dbError) {
          console.error('Error saving question to database:', dbError);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: "I apologize, but I'm having trouble processing your request right now. This could be due to API limits, connectivity issues, or the complexity of your question. Please try again in a moment or rephrase your question.\n\nDon't worry - learning sometimes involves overcoming technical hurdles too! 😊",
        timestamp: new Date(),
        sources: [
          'Technical Support Guide',
          'API Documentation'
        ],
        followUps: [
          "Try rephrasing your question in simpler terms",
          "Check your internet connection",
          "Ask about a different topic for now"
        ]
      };

      setMessages(prev => [...prev, errorMessage]);
      setError("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    if (files.length > 0) {
      setIsLoading(true);
      
      try {
        const fileNames = files.map(f => f.name).join(', ');
        
        const uploadMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `Perfect! 📁 I've successfully received your ${files.length} file(s): **${fileNames}**. I'm ready to help you understand and work with this material${selectedSubject ? ` in the context of **${selectedSubject}**` : ''}!\n\nI can analyze the content, answer questions about it, create study guides, generate practice questions, or explain any concepts you find challenging. The files are now part of our study session context.\n\nWhat would you like to explore from these materials? 🤔`,
          timestamp: new Date(),
          sources: files.map(f => `Uploaded Document: ${f.name}`),
          followUps: [
            'Summarize the main points from these files',
            'Create study questions based on this material',
            'Explain the key concepts in simple terms',
            'Help me identify the most important information'
          ]
        };
        
        setMessages(prev => [...prev, uploadMessage]);
      } catch (error) {
        console.error('Error processing files:', error);
        setError("Error processing uploaded files. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTextExtracted = (text: string, documentType: string) => {
    setExtractedTexts(prev => [...prev, { text, type: documentType }]);
    
    const extractionMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Excellent! 📸 I've successfully analyzed your **${documentType}** image using Vision AI! The text has been extracted and I can now help you understand this material${selectedSubject ? ` in the context of **${selectedSubject}**` : ''}.\n\n**Document Type:** ${documentType}\n**Content Preview:** ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}\n\nThis looks like great study material! I can help you understand difficult concepts, create practice questions, summarize key points, or explain anything that seems confusing. What would you like to focus on? 🎯`,
      timestamp: new Date(),
      sources: [`Vision AI Analysis: ${documentType}`, 'Google Cloud Vision API'],
      followUps: [
        'Explain the key concepts from this image',
        'Create practice questions from this content',
        'Break down any difficult parts for me',
        'Help me understand how this connects to my studies'
      ]
    };
    
    setMessages(prev => [...prev, extractionMessage]);
    setShowImageUpload(false);
  };

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
    
    console.log(`Message ${messageId} rated: ${rating}`);
  };

  const handleFollowUp = (question: string) => {
    setInputValue(question);
  };

  // Save study session when component unmounts or user leaves
  useEffect(() => {
    const saveSession = async () => {
      if (user && questionCount > 0) {
        const duration = Math.floor((Date.now() - sessionStartTime) / 60000); // minutes
        try {
          await userDataService.saveStudySession({
            user_id: user.id,
            title: `Study Session - ${selectedSubject || 'Mixed Subjects'} - ${new Date().toLocaleDateString()}`,
            subject: selectedSubject || 'Mixed Subjects',
            duration,
            questions_count: questionCount
          });
        } catch (error) {
          console.error('Error saving study session:', error);
        }
      }
    };

    return () => {
      saveSession();
    };
  }, [user, questionCount, sessionStartTime, selectedSubject]);

  const getTitle = () => {
    if (selectedSubject) {
      return userProfile ? `${userProfile.display_name}'s ${selectedSubject} Session` : `${selectedSubject} Study Session`;
    }
    return userProfile ? `${userProfile.display_name}'s Study Session` : 'Study Session';
  };

  return (
    <div className="flex h-screen bg-accent-50 dark:bg-dark-primary transition-all duration-500">
      {/* Main Chat Area - Full Width */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Header */}
        <Navigation
          onBack={onBack}
          onHome={onBack}
          showBack={true}
          showHome={true}
          title={getTitle()}
          darkMode={darkMode}
        />

        {/* Header with Controls */}
        <header className="bg-accent-50 dark:bg-dark-surface border-b border-accent-200 dark:border-dark-muted px-6 py-4 flex items-center justify-between transition-all duration-500 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-accent-500 dark:text-accent-400 transition-colors duration-500">
                {selectedSubject ? `Focused on ${selectedSubject}` : 'Your friendly AI study companion'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleDarkMode}
              className="p-3 hover:bg-accent-100 dark:hover:bg-dark-muted rounded-xl transition-all duration-300"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-highlight-500" />
              ) : (
                <Moon className="w-5 h-5 text-accent-600" />
              )}
            </button>

            {user && userProfile && (
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 hover:bg-accent-100 dark:hover:bg-dark-muted rounded-xl transition-all duration-300">
                  {userProfile.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.display_name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-accent-50 dark:bg-dark-surface rounded-2xl shadow-xl border border-accent-200 dark:border-dark-muted opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-2">
                    <button
                      onClick={onShowProfile}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-accent-100 dark:hover:bg-dark-muted rounded-xl transition-all duration-300"
                    >
                      <Settings className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                      <span className="text-accent-800 dark:text-accent-100">View Profile</span>
                    </button>
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-highlight-100 dark:hover:bg-highlight-900/30 rounded-xl transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4 text-highlight-600 dark:text-highlight-400" />
                      <span className="text-highlight-700 dark:text-highlight-300">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-highlight-50 dark:bg-highlight-900/20 border-l-4 border-highlight-400 p-4 mx-6 mt-4 rounded-r-xl transition-all duration-500">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-highlight-600 mr-3" />
              <p className="text-highlight-700 dark:text-highlight-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-highlight-500 hover:text-highlight-700 dark:hover:text-highlight-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Image Upload Modal */}
        {showImageUpload && (
          <div className="mx-6 mt-4">
            <div className="bg-accent-50 dark:bg-dark-surface border border-accent-200 dark:border-dark-muted rounded-3xl p-6 shadow-lg transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-100">Upload Study Images</h3>
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="p-2 hover:bg-accent-100 dark:hover:bg-dark-muted rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5 text-accent-600 dark:text-accent-300" />
                </button>
              </div>
              <ImageUpload onTextExtracted={handleTextExtracted} darkMode={darkMode} />
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRating={handleRating}
              onFollowUp={handleFollowUp}
              onViewSource={setSelectedSource}
              darkMode={darkMode}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-accent-50 dark:bg-dark-surface rounded-3xl px-8 py-6 shadow-sm border border-accent-200 dark:border-dark-muted max-w-xs transition-all duration-500">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-accent-500 dark:text-accent-400">Thinking about your question... 🤔</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-accent-50 dark:bg-dark-surface border-t border-accent-200 dark:border-dark-muted px-6 py-6 transition-all duration-500">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <div className="flex items-center bg-accent-100 dark:bg-dark-muted rounded-3xl p-5 transition-all duration-500 shadow-sm">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={selectedSubject 
                    ? `Ask me anything about ${selectedSubject}... 📚`
                    : userProfile?.subjects_of_interest.length > 0 
                      ? `Ask me about ${userProfile.subjects_of_interest.slice(0, 2).join(', ')} or any other subject...`
                      : "Ask me anything! I'm here to help you learn and understand... 😊"
                  }
                  className="flex-1 bg-transparent border-none outline-none text-accent-800 dark:text-accent-100 placeholder-accent-500 dark:placeholder-accent-400 transition-colors duration-500"
                  disabled={isLoading}
                />
                
                <div className="flex items-center space-x-2 ml-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.md"
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      showImageUpload 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                        : 'hover:bg-accent-200 dark:hover:bg-dark-surface text-accent-600 dark:text-accent-300'
                    }`}
                    title="Upload images with Vision AI"
                    disabled={isLoading}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 hover:bg-accent-200 dark:hover:bg-dark-surface rounded-xl transition-all duration-300"
                    title="Upload documents"
                    disabled={isLoading}
                  >
                    <Paperclip className="w-5 h-5 text-accent-600 dark:text-accent-300" />
                  </button>
                  
                  <button
                    className="p-3 hover:bg-accent-200 dark:hover:bg-dark-surface rounded-xl transition-all duration-300 opacity-50 cursor-not-allowed"
                    title="Voice input (coming soon)"
                    disabled
                  >
                    <Mic className="w-5 h-5 text-accent-400 dark:text-accent-500" />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-3xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* File Display */}
          {(uploadedFiles.length > 0 || extractedTexts.length > 0) && (
            <div className="mt-6 space-y-3">
              {/* Regular Files */}
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-3 rounded-xl text-sm border border-primary-200 dark:border-primary-700 transition-all duration-500 shadow-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                      <span className="text-xs text-primary-600 dark:text-primary-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Extracted Texts */}
              {extractedTexts.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {extractedTexts.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 px-4 py-3 rounded-xl text-sm border border-secondary-200 dark:border-secondary-700 transition-all duration-500 shadow-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>{item.type} Image</span>
                      <span className="text-xs text-secondary-600 dark:text-secondary-400">({item.text.length} chars)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Source Modal */}
      {selectedSource && (
        <SourceModal
          source={selectedSource}
          isOpen={!!selectedSource}
          onClose={() => setSelectedSource(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default ChatInterface;