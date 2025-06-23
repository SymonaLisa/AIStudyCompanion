import React from 'react';
import { Home, ArrowLeft, Brain } from 'lucide-react';

interface NavigationProps {
  onHome?: () => void;
  onBack?: () => void;
  showHome?: boolean;
  showBack?: boolean;
  title?: string;
  darkMode?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
  onHome, 
  onBack, 
  showHome = true, 
  showBack = true, 
  title,
  darkMode = false 
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-accent-50/80 dark:bg-dark-primary/80 backdrop-blur-sm border-b border-accent-200/50 dark:border-dark-surface/50 transition-all duration-500">
      <div className="flex items-center space-x-4">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="p-3 hover:bg-accent-100 dark:hover:bg-dark-muted rounded-xl transition-all duration-300 group"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-accent-600 dark:text-accent-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
          </button>
        )}
        
        {title && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-accent-800 dark:text-accent-100">{title}</h1>
          </div>
        )}
      </div>

      {showHome && onHome && (
        <button
          onClick={onHome}
          className="flex items-center space-x-3 px-4 py-2 bg-accent-100 dark:bg-dark-surface hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group"
          title="Go to home"
        >
          <Home className="w-5 h-5 text-accent-600 dark:text-accent-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
          <span className="text-accent-700 dark:text-accent-200 group-hover:text-primary-700 dark:group-hover:text-primary-300 font-medium transition-colors">
            Home
          </span>
        </button>
      )}
    </div>
  );
};

export default Navigation;