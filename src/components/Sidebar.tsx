import React from 'react';
import { 
  History, 
  Bookmark, 
  FileText, 
  X, 
  Clock, 
  Star, 
  BookOpen, 
  Calculator, 
  Globe, 
  Palette,
  Code,
  Music,
  Microscope,
  Languages,
  TrendingUp,
  Pen,
  Image as ImageIcon,
  Camera
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  uploadedFiles: File[];
  extractedTexts: Array<{text: string, type: string}>;
  darkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, uploadedFiles, extractedTexts, darkMode }) => {
  const recentTopics = [
    { id: 1, title: 'Shakespeare\'s Hamlet Analysis', subject: 'Literature', time: '2 hours ago', icon: BookOpen },
    { id: 2, title: 'Calculus Integration Methods', subject: 'Mathematics', time: '1 day ago', icon: Calculator },
    { id: 3, title: 'French Revolution Causes', subject: 'History', time: '2 days ago', icon: Globe },
    { id: 4, title: 'Organic Chemistry Reactions', subject: 'Chemistry', time: '3 days ago', icon: Microscope },
    { id: 5, title: 'Python Data Structures', subject: 'Computer Science', time: '1 week ago', icon: Code },
    { id: 6, title: 'Renaissance Art Movements', subject: 'Art History', time: '1 week ago', icon: Palette },
  ];

  const subjects = [
    { name: 'Mathematics', icon: Calculator, color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
    { name: 'Sciences', icon: Microscope, color: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400' },
    { name: 'Literature', icon: BookOpen, color: 'bg-accent-200 dark:bg-accent-700 text-accent-700 dark:text-accent-200' },
    { name: 'History', icon: Globe, color: 'bg-highlight-100 dark:bg-highlight-900/30 text-highlight-600 dark:text-highlight-400' },
    { name: 'Computer Science', icon: Code, color: 'bg-accent-300 dark:bg-accent-600 text-accent-700 dark:text-accent-200' },
    { name: 'Arts', icon: Palette, color: 'bg-secondary-200 dark:bg-secondary-800/50 text-secondary-700 dark:text-secondary-300' },
    { name: 'Music', icon: Music, color: 'bg-primary-200 dark:bg-primary-800/50 text-primary-700 dark:text-primary-300' },
    { name: 'Languages', icon: Languages, color: 'bg-highlight-200 dark:bg-highlight-800/50 text-highlight-700 dark:text-highlight-300' },
    { name: 'Economics', icon: TrendingUp, color: 'bg-secondary-300 dark:bg-secondary-700/50 text-secondary-800 dark:text-secondary-200' },
    { name: 'Writing', icon: Pen, color: 'bg-primary-300 dark:bg-primary-700/50 text-primary-800 dark:text-primary-200' },
  ];

  const bookmarkedQA = [
    { 
      id: 1, 
      question: 'What are the main themes in To Kill a Mockingbird?', 
      answer: 'The novel explores themes of racial injustice, moral growth, and the loss of innocence...',
      subject: 'Literature'
    },
    { 
      id: 2, 
      question: 'How do you solve quadratic equations?', 
      answer: 'Quadratic equations can be solved using the quadratic formula, factoring, or completing the square...',
      subject: 'Mathematics'
    },
    { 
      id: 3, 
      question: 'What caused the fall of the Roman Empire?', 
      answer: 'The fall resulted from multiple factors including economic decline, military pressures...',
      subject: 'History'
    },
    { 
      id: 4, 
      question: 'Explain object-oriented programming principles', 
      answer: 'OOP is based on four main principles: encapsulation, inheritance, polymorphism...',
      subject: 'Computer Science'
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:relative left-0 top-0 h-full w-80 bg-accent-50 dark:bg-dark-surface border-r border-accent-200 dark:border-dark-muted transform transition-all duration-500 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-accent-200 dark:border-dark-muted">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-accent-800 dark:text-accent-100">Study Dashboard</h2>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-accent-100 dark:hover:bg-dark-muted rounded-xl transition-all duration-300 lg:hidden"
            >
              <X className="w-5 h-5 text-accent-600 dark:text-accent-300" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Recent Topics */}
          <div>
            <div className="flex items-center space-x-3 mb-5">
              <History className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              <h3 className="text-sm font-semibold text-accent-800 dark:text-accent-100">Recent Topics</h3>
            </div>
            <div className="space-y-4">
              {recentTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 bg-accent-100 dark:bg-dark-muted rounded-2xl hover:bg-accent-200 dark:hover:bg-dark-surface cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-accent-50 dark:bg-dark-surface rounded-xl flex items-center justify-center shadow-sm">
                      <topic.icon className="w-5 h-5 text-accent-600 dark:text-accent-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-accent-800 dark:text-accent-100 mb-2 truncate">{topic.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg">{topic.subject}</span>
                        <span className="text-xs text-accent-500 dark:text-accent-400">{topic.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Categories */}
          <div>
            <h3 className="text-sm font-semibold text-accent-800 dark:text-accent-100 mb-5">Subject Categories</h3>
            <div className="grid grid-cols-2 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject.name}
                  className="p-4 bg-accent-100 dark:bg-dark-muted rounded-2xl hover:bg-accent-200 dark:hover:bg-dark-surface cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${subject.color}`}>
                    <subject.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-accent-800 dark:text-accent-100 leading-tight">{subject.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <FileText className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                <h3 className="text-sm font-semibold text-accent-800 dark:text-accent-100">Uploaded Files</h3>
              </div>
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-2xl border border-primary-200 dark:border-primary-700 transition-all duration-500 shadow-sm"
                  >
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm text-primary-800 dark:text-primary-200 truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Images */}
          {extractedTexts.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <Camera className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                <h3 className="text-sm font-semibold text-accent-800 dark:text-accent-100">Analyzed Images</h3>
              </div>
              <div className="space-y-3">
                {extractedTexts.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 bg-secondary-50 dark:bg-secondary-900/30 rounded-2xl border border-secondary-200 dark:border-secondary-700 transition-all duration-500 shadow-sm"
                  >
                    <ImageIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-secondary-800 dark:text-secondary-200 font-medium">{item.type}</span>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 truncate mt-1">
                        {item.text.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarked Q&A */}
          <div>
            <div className="flex items-center space-x-3 mb-5">
              <Bookmark className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              <h3 className="text-sm font-semibold text-accent-800 dark:text-accent-100">Bookmarked Q&A</h3>
            </div>
            <div className="space-y-4">
              {bookmarkedQA.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-highlight-50 dark:bg-highlight-900/20 rounded-2xl hover:bg-highlight-100 dark:hover:bg-highlight-800/30 cursor-pointer transition-all duration-300 border border-highlight-200 dark:border-highlight-700 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-highlight-600 dark:text-highlight-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-accent-800 dark:text-accent-100 mb-2">{item.question}</h4>
                      <p className="text-xs text-accent-600 dark:text-accent-300 truncate mb-3">{item.answer}</p>
                      <span className="text-xs text-highlight-700 dark:text-highlight-300 bg-highlight-200 dark:bg-highlight-800/50 px-3 py-1 rounded-full">
                        {item.subject}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;