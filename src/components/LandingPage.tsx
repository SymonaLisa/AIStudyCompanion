import React from 'react';
import { 
  BookOpen, 
  Upload, 
  Search, 
  Target, 
  Zap, 
  Star, 
  ArrowRight,
  Brain,
  FileText,
  MessageCircle,
  Calculator,
  Globe,
  Palette,
  Code,
  Music,
  Microscope,
  Languages,
  TrendingUp,
  Moon,
  Sun,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile } from '../types/user';

interface LandingPageProps {
  onStartStudying: (subject?: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  onShowProfile: () => void;
  onSignOut: () => void;
  onShowAuth: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartStudying, 
  darkMode, 
  onToggleDarkMode,
  user,
  userProfile,
  onShowProfile,
  onSignOut,
  onShowAuth
}) => {
  const subjects = [
    { name: 'Mathematics', icon: Calculator, color: 'from-primary-400 to-primary-500', examples: ['Calculus', 'Statistics', 'Algebra'] },
    { name: 'Sciences', icon: Microscope, color: 'from-secondary-400 to-secondary-500', examples: ['Biology', 'Chemistry', 'Physics'] },
    { name: 'History', icon: Globe, color: 'from-accent-500 to-accent-600', examples: ['World Wars', 'Ancient Civilizations', 'Modern Politics'] },
    { name: 'Literature', icon: BookOpen, color: 'from-primary-500 to-secondary-400', examples: ['Shakespeare', 'Poetry Analysis', 'Creative Writing'] },
    { name: 'Computer Science', icon: Code, color: 'from-accent-600 to-accent-700', examples: ['Programming', 'Algorithms', 'Data Structures'] },
    { name: 'Arts', icon: Palette, color: 'from-secondary-500 to-primary-400', examples: ['Art History', 'Design Theory', 'Visual Arts'] },
    { name: 'Music', icon: Music, color: 'from-primary-600 to-secondary-500', examples: ['Music Theory', 'Composition', 'Music History'] },
    { name: 'Languages', icon: Languages, color: 'from-accent-500 to-primary-500', examples: ['Spanish', 'French', 'Linguistics'] },
    { name: 'Economics', icon: TrendingUp, color: 'from-secondary-600 to-primary-500', examples: ['Microeconomics', 'Finance', 'Business'] }
  ];

  const handleSubjectClick = (subjectName: string) => {
    // Start studying with the specific subject context
    onStartStudying(subjectName);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 bg-accent-50/80 dark:bg-dark-primary/80 backdrop-blur-sm border-b border-accent-200/50 dark:border-dark-surface/50 sticky top-0 z-50 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              StudyAI
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleDarkMode}
              className="p-3 rounded-xl bg-accent-100 dark:bg-dark-surface hover:bg-accent-200 dark:hover:bg-dark-muted transition-all duration-300 shadow-sm"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-highlight-500" />
              ) : (
                <Moon className="w-5 h-5 text-accent-600" />
              )}
            </button>

            {user && userProfile ? (
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <button
                    onClick={onShowProfile}
                    className="flex items-center space-x-3 px-4 py-2 bg-accent-100 dark:bg-dark-surface hover:bg-accent-200 dark:hover:bg-dark-muted rounded-xl transition-all duration-300 shadow-sm"
                  >
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
                    <span className="text-accent-800 dark:text-accent-100 font-medium">
                      {userProfile.display_name}
                    </span>
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
                
                <button
                  onClick={() => onStartStudying()}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Continue Studying
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onShowAuth}
                  className="px-6 py-3 bg-accent-100 dark:bg-dark-surface text-accent-700 dark:text-accent-300 rounded-xl hover:bg-accent-200 dark:hover:bg-dark-muted transition-all duration-300 shadow-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onStartStudying()}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center px-6 py-3 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-10 transition-all duration-500 shadow-sm">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Learning for All Subjects
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-accent-800 dark:text-accent-100 mb-8 leading-tight transition-colors duration-500">
            Your Personal{' '}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              AI Study Companion
            </span>
          </h1>
          
          <p className="text-xl text-accent-600 dark:text-accent-300 mb-12 max-w-3xl mx-auto leading-relaxed transition-colors duration-500">
            Master any subject with AI-powered study assistance. From mathematics to literature, 
            science to arts—get instant, cited answers across all academic disciplines.
            {user && userProfile && (
              <span className="block mt-4 text-primary-600 dark:text-primary-400 font-medium">
                Welcome back, {userProfile.display_name}! Ready to continue your learning journey?
              </span>
            )}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => onStartStudying()}
              className="px-10 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 group transform hover:scale-105"
            >
              <span>{user ? 'Continue Studying' : 'Start Studying'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {!user && (
              <button
                onClick={onShowAuth}
                className="px-10 py-5 bg-accent-50 dark:bg-dark-surface text-accent-700 dark:text-accent-200 rounded-2xl font-semibold border-2 border-accent-200 dark:border-dark-muted hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-dark-muted transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Subjects Showcase */}
      <section className="px-6 py-24 bg-accent-50/50 dark:bg-dark-secondary/30 transition-all duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-accent-800 dark:text-accent-100 mb-6 transition-colors duration-500">
              Master Every Subject
            </h2>
            <p className="text-lg text-accent-600 dark:text-accent-300 max-w-3xl mx-auto transition-colors duration-500">
              From STEM to humanities, our AI companion provides expert assistance across all academic disciplines.
              Click on any subject to start learning!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject, index) => (
              <div
                key={subject.name}
                className="bg-accent-50 dark:bg-dark-surface p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-accent-100 dark:border-dark-muted group cursor-pointer transform hover:scale-105"
                onClick={() => handleSubjectClick(subject.name)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <subject.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-accent-800 dark:text-accent-100 mb-4 transition-colors duration-500">{subject.name}</h3>
                <div className="space-y-3">
                  {subject.examples.map((example, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-secondary-400 dark:bg-secondary-500 rounded-full"></div>
                      <span className="text-accent-600 dark:text-accent-300 transition-colors duration-500">{example}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-primary-600 dark:text-primary-400 font-medium group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300">
                    Start Learning
                  </span>
                  <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 bg-accent-50/30 dark:bg-dark-primary/50 transition-all duration-500">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-accent-800 dark:text-accent-100 mb-6 transition-colors duration-500">
              Everything you need to study smarter
            </h2>
            <p className="text-lg text-accent-600 dark:text-accent-300 max-w-3xl mx-auto transition-colors duration-500">
              Harness the power of AI to enhance your learning with intelligent features designed for students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="bg-accent-50 dark:bg-dark-surface p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-accent-100 dark:border-dark-muted group">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors duration-300">
                <MessageCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-4 transition-colors duration-500">Ask Questions</h3>
              <p className="text-accent-600 dark:text-accent-300 leading-relaxed transition-colors duration-500">
                Get instant, accurate answers to your study questions with detailed explanations and examples.
              </p>
            </div>

            <div className="bg-accent-50 dark:bg-dark-surface p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-accent-100 dark:border-dark-muted group">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-secondary-200 dark:group-hover:bg-secondary-800/50 transition-colors duration-300">
                <Upload className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-4 transition-colors duration-500">Upload Notes</h3>
              <p className="text-accent-600 dark:text-accent-300 leading-relaxed transition-colors duration-500">
                Upload your class notes, PDFs, and documents to build your personalized knowledge base.
              </p>
            </div>

            <div className="bg-accent-50 dark:bg-dark-surface p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-accent-100 dark:border-dark-muted group">
              <div className="w-16 h-16 bg-highlight-100 dark:bg-highlight-900/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-highlight-200 dark:group-hover:bg-highlight-800/50 transition-colors duration-300">
                <Search className="w-8 h-8 text-highlight-600 dark:text-highlight-400" />
              </div>
              <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-4 transition-colors duration-500">Get Citations</h3>
              <p className="text-accent-600 dark:text-accent-300 leading-relaxed transition-colors duration-500">
                Every answer comes with proper citations and sources, so you can verify and dive deeper.
              </p>
            </div>

            <div className="bg-accent-50 dark:bg-dark-surface p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-accent-100 dark:border-dark-muted group">
              <div className="w-16 h-16 bg-accent-200 dark:bg-accent-700 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent-300 dark:group-hover:bg-accent-600 transition-colors duration-300">
                <Target className="w-8 h-8 text-accent-700 dark:text-accent-200" />
              </div>
              <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-4 transition-colors duration-500">Track Progress</h3>
              <p className="text-accent-600 dark:text-accent-300 leading-relaxed transition-colors duration-500">
                Monitor your learning journey with personalized insights and study recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-accent-800 dark:text-accent-100 mb-8 transition-colors duration-500">
                Study with confidence across all disciplines
              </h2>
              <p className="text-lg text-accent-600 dark:text-accent-300 mb-10 leading-relaxed transition-colors duration-500">
                Whether you're tackling calculus problems, analyzing Shakespeare, or understanding quantum physics—
                our AI adapts to your subject and learning style.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-3 transition-colors duration-500">Subject-Specific Expertise</h3>
                    <p className="text-accent-600 dark:text-accent-300 transition-colors duration-500">Get explanations tailored to each academic discipline's unique requirements.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-3 transition-colors duration-500">Academic Sources</h3>
                    <p className="text-accent-600 dark:text-accent-300 transition-colors duration-500">All answers backed by credible academic sources and proper citations.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-highlight-100 dark:bg-highlight-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <BookOpen className="w-5 h-5 text-highlight-600 dark:text-highlight-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-3 transition-colors duration-500">Cross-Disciplinary Learning</h3>
                    <p className="text-accent-600 dark:text-accent-300 transition-colors duration-500">Discover connections between subjects for deeper understanding.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-3xl p-10 shadow-2xl transition-all duration-500">
                <div className="bg-accent-50 dark:bg-dark-surface rounded-2xl p-8 shadow-lg transition-all duration-500">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-accent-800 dark:text-accent-100 transition-colors duration-500">StudyAI</span>
                  </div>
                  <div className="text-accent-600 dark:text-accent-300 text-sm mb-6 transition-colors duration-500">
                    "Explain the themes in Hamlet and their relevance to modern literature"
                  </div>
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-sm text-accent-700 dark:text-accent-300 transition-all duration-500">
                    Hamlet explores several universal themes including revenge, madness, and moral corruption. 
                    These themes remain relevant in contemporary literature as they address fundamental human experiences...
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-xs text-accent-500 dark:text-accent-400 transition-colors duration-500">Source: Norton Anthology of Literature</span>
                    <div className="flex space-x-3">
                      <button className="text-primary-600 dark:text-primary-400 text-xs hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Follow-up</button>
                      <button className="text-secondary-600 dark:text-secondary-400 text-xs hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors">Rate</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to excel in every subject?
          </h2>
          <p className="text-xl text-primary-100 mb-12 max-w-3xl mx-auto">
            {user 
              ? `Welcome back, ${userProfile?.display_name}! Continue your learning journey with personalized AI assistance.`
              : 'Join thousands of students who are already mastering diverse subjects with AI assistance.'
            }
          </p>
          <button
            onClick={() => onStartStudying()}
            className="px-12 py-6 bg-white text-primary-600 rounded-2xl font-semibold hover:bg-accent-50 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 mx-auto group transform hover:scale-105"
          >
            <span>{user ? 'Continue Learning' : 'Start Your Journey'}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-accent-800 dark:bg-dark-primary text-center transition-all duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-accent-100">StudyAI</span>
          </div>
          <p className="text-accent-400 dark:text-accent-500 transition-colors duration-500 mb-8">
            Empowering students with AI-driven learning solutions across all academic disciplines.
          </p>
          
          {/* Bolt Badge */}
          <div className="flex justify-center">
            <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 px-6 py-3 bg-accent-700 dark:bg-dark-secondary hover:bg-accent-600 dark:hover:bg-dark-surface rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group"
              title="Built with Bolt"
            >
              <img
                src="/white_circle_360x360.png"
                alt="Bolt"
                className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-accent-200 dark:text-accent-300 font-medium group-hover:text-white transition-colors duration-300">
                Built with Bolt
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;