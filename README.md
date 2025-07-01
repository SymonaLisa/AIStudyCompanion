# StudyAI - AI-Powered Study Companion

A comprehensive AI study companion application that helps students learn across all academic disciplines with personalized assistance, progress tracking, and intelligent features.

## 🌟 Features

### Core Functionality
- **AI-Powered Chat Interface**: Get instant, accurate answers to study questions with detailed explanations  
- **Multi-Subject Support**: Mathematics, Sciences, Literature, History, Computer Science, Arts, Languages, and more  
- **Document Upload**: Upload PDFs, documents, and study materials for AI analysis  
- **Vision AI Integration**: Take photos of handwritten notes, textbooks, or whiteboards for text extraction  
- **Personalized Learning**: Adaptive responses based on academic level and preferred difficulty  
- **Progress Tracking**: Monitor study sessions, question counts, and learning streaks  

### User Experience
- **Beautiful UI/UX**: Modern, responsive design with dark/light mode support  
- **Subject-Focused Sessions**: Start studying with specific subject context  
- **Follow-up Questions**: AI-generated suggestions to deepen understanding  
- **Source Citations**: All answers include credible academic sources  
- **Bookmarking**: Save important questions and answers for later review  
- **Profile Management**: Customize learning preferences and track achievements  

### Technical Features
- **Real-time Chat**: Smooth, responsive messaging interface  
- **File Processing**: Support for multiple document formats  
- **Image Analysis**: Google Vision API integration for OCR  
- **Database Integration**: Supabase backend with user authentication  
- **Responsive Design**: Works seamlessly on desktop and mobile devices  

## 🚀 Live Demo

**Deployed Application**: [https://guileless-dodol-6ee36c.netlify.app](https://guileless-dodol-6ee36c.netlify.app)

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript  
- **Vite** for fast development and building  
- **Tailwind CSS** for styling with custom design system  
- **Lucide React** for beautiful icons  

### Backend & Services
- **Supabase** for database, authentication, and storage  
- **Google Gemini AI** for intelligent responses  
- **Google Vision API** for image text extraction  
- **Netlify** for deployment and hosting  

### Key Libraries
- `@supabase/supabase-js` - Database and auth integration  
- `@google/generative-ai` - AI response generation  
- `@google-cloud/vision` - Image text extraction  
- `@tailwindcss/typography` - Rich text formatting  

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed  
- A Supabase account and project  
- Google Cloud Platform account with Gemini AI and Vision API access  
- Environment variables configured (see setup section)  

## ⚙️ Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_VISION_API_KEY=your_google_vision_api_key
```

### Getting API Keys

1. **Supabase**: 
   - Create a project at [supabase.com](https://supabase.com)
   - Find your URL and anon key in Project Settings > API

2. **Google Gemini AI**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key for Gemini

3. **Google Vision API**:
   - Enable Vision API in [Google Cloud Console](https://console.cloud.google.com)
   - Create credentials and get your API key

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

4. **Set up Supabase database**
   ```bash
   # The database schema will be automatically created when you first run the app
   # Make sure your Supabase project is properly configured
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📊 Database Schema

The application uses the following main tables:

- **user_profiles**: User information, preferences, and statistics
- **study_sessions**: Track study session duration and subjects
- **saved_questions**: Store Q&A pairs with sources and bookmarks

Key features:
- Row Level Security (RLS) enabled
- Automatic triggers for updating user statistics
- Optimized indexes for performance

## 🎯 Usage Guide

### Getting Started
1. **Sign Up/Sign In**: Create an account or sign in to save progress
2. **Complete Profile Setup**: Set your academic level, subjects, and preferences
3. **Start Studying**: Choose a subject or ask any question

### Key Features
- **Ask Questions**: Type any study-related question for instant AI assistance
- **Upload Documents**: Drag and drop PDFs or documents for analysis
- **Take Photos**: Use the camera feature to capture notes or textbook pages
- **Track Progress**: View your study statistics and learning streak
- **Bookmark Content**: Save important Q&A pairs for future reference

### Tips for Best Results
- Be specific in your questions for more targeted responses
- Use the subject-focused sessions for better context
- Upload clear, well-lit images for better text extraction
- Review follow-up questions to deepen understanding

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── AuthModal.tsx   # Authentication modal
│   ├── ChatInterface.tsx # Main chat interface
│   ├── LandingPage.tsx # Homepage
│   ├── UserProfile.tsx # Profile management
│   └── ...
├── services/           # API and service layers
│   ├── authService.ts  # Authentication logic
│   ├── geminiService.ts # AI response generation
│   ├── visionService.ts # Image text extraction
│   └── userDataService.ts # Database operations
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🎨 Design System

The application uses a carefully crafted design system with:

- **Color Palette**: Calming blues, sage greens, and warm accents
- **Typography**: Clear hierarchy with proper contrast ratios
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable, accessible UI components
- **Dark Mode**: Full dark theme support

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **Authentication**: Secure user authentication via Supabase
- **API Key Protection**: Environment-based configuration
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Proper cross-origin resource sharing

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## 🚀 Deployment

The application is deployed on Netlify with automatic builds from the main branch.

### Manual Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

### Environment Variables for Production
Ensure all environment variables are properly configured in your hosting platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section below
2. Review the environment setup
3. Ensure all API keys are properly configured
4. Check the browser console for error messages

### Common Issues

**Database Connection Errors**:
- Verify Supabase URL and keys are correct
- Check if RLS policies are properly configured

**AI Response Failures**:
- Confirm Gemini API key is valid and has quota
- Check network connectivity

**Vision API Issues**:
- Ensure Vision API is enabled in Google Cloud
- Verify API key has proper permissions

## 🙏 Acknowledgments

- Google for Gemini AI and Vision API
- Supabase for backend infrastructure
- Tailwind CSS for the design system
- Lucide for beautiful icons
- The open-source community for inspiration and tools

---

**Built with ❤️ for students worldwide**
