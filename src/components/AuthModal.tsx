import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  darkMode: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, darkMode }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
        await authService.signUp(formData.email, formData.password, formData.fullName);
        setSuccess('Account created successfully! Please check your email to verify your account.');
      } else {
        await authService.signIn(formData.email, formData.password);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    });
    setError(null);
    setSuccess(null);
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-accent-50 dark:bg-dark-surface rounded-3xl max-w-md w-full shadow-2xl transition-all duration-500 border border-accent-200 dark:border-dark-muted">
        {/* Header */}
        <div className="p-8 border-b border-accent-200 dark:border-dark-muted">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-accent-800 dark:text-accent-100">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent-100 dark:hover:bg-dark-muted rounded-xl transition-all duration-300"
            >
              <X className="w-6 h-6 text-accent-600 dark:text-accent-300" />
            </button>
          </div>
          <p className="text-accent-600 dark:text-accent-400 mt-2">
            {isSignUp 
              ? 'Join StudyAI to save your progress and personalize your learning'
              : 'Sign in to access your personalized study dashboard'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Full Name (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-500 dark:text-accent-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={isSignUp}
                  className="w-full pl-12 pr-4 py-4 bg-accent-100 dark:bg-dark-muted border border-accent-200 dark:border-dark-surface rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-accent-800 dark:text-accent-100 transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-500 dark:text-accent-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-accent-100 dark:bg-dark-muted border border-accent-200 dark:border-dark-surface rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-accent-800 dark:text-accent-100 transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-500 dark:text-accent-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-12 py-4 bg-accent-100 dark:bg-dark-muted border border-accent-200 dark:border-dark-surface rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-accent-800 dark:text-accent-100 transition-all duration-300"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-accent-500 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent-500 dark:text-accent-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={isSignUp}
                  className="w-full pl-12 pr-4 py-4 bg-accent-100 dark:bg-dark-muted border border-accent-200 dark:border-dark-surface rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-accent-800 dark:text-accent-100 transition-all duration-300"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-highlight-50 dark:bg-highlight-900/20 border-l-4 border-highlight-400 p-4 rounded-r-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-highlight-600 mr-3" />
                <p className="text-highlight-700 dark:text-highlight-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-secondary-50 dark:bg-secondary-900/20 border-l-4 border-secondary-400 p-4 rounded-r-xl">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-secondary-600 mr-3" />
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>

          {/* Switch Mode */}
          <div className="text-center">
            <p className="text-accent-600 dark:text-accent-400 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={switchMode}
                className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;