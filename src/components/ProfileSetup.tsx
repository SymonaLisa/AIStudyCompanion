import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  Target, 
  GraduationCap, 
  Save,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile } from '../types/user';

interface ProfileSetupProps {
  userId: string;
  onComplete: (profile: UserProfile) => void;
  darkMode: boolean;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ userId, onComplete, darkMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    academic_level: 'undergraduate' as const,
    subjects_of_interest: [] as string[],
    learning_goals: [] as string[],
    preferred_difficulty: 'intermediate' as const
  });

  const academicLevels = [
    { value: 'high_school', label: 'High School', icon: '🎓' },
    { value: 'undergraduate', label: 'Undergraduate', icon: '📚' },
    { value: 'graduate', label: 'Graduate', icon: '🎯' },
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'other', label: 'Other', icon: '📖' }
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Literature', 'History', 'Philosophy', 'Psychology', 'Economics',
    'Art', 'Music', 'Languages', 'Engineering', 'Medicine', 'Law'
  ];

  const learningGoals = [
    'Improve test scores', 'Understand complex concepts', 'Complete assignments',
    'Prepare for exams', 'Research projects', 'Career development',
    'Personal enrichment', 'Academic writing', 'Problem solving'
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner', description: 'I prefer simple explanations and basic concepts' },
    { value: 'intermediate', label: 'Intermediate', description: 'I can handle moderate complexity and detail' },
    { value: 'advanced', label: 'Advanced', description: 'I want in-depth analysis and complex explanations' }
  ];

  const handleSubjectToggle = (subject: string) => {
    setProfileData(prev => ({
      ...prev,
      subjects_of_interest: prev.subjects_of_interest.includes(subject)
        ? prev.subjects_of_interest.filter(s => s !== subject)
        : [...prev.subjects_of_interest, subject]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setProfileData(prev => ({
      ...prev,
      learning_goals: prev.learning_goals.includes(goal)
        ? prev.learning_goals.filter(g => g !== goal)
        : [...prev.learning_goals, goal]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const profile = await authService.createProfile({
        user_id: userId,
        ...profileData,
        study_streak: 0,
        total_questions_asked: 0,
        total_study_time: 0
      });
      onComplete(profile);
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-surface flex items-center justify-center p-4 transition-all duration-500">
      <div className="bg-accent-50 dark:bg-dark-surface rounded-3xl max-w-2xl w-full shadow-2xl transition-all duration-500 border border-accent-200 dark:border-dark-muted">
        {/* Header */}
        <div className="p-8 border-b border-accent-200 dark:border-dark-muted">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-accent-800 dark:text-accent-100">Complete Your Profile</h1>
              <p className="text-accent-600 dark:text-accent-400">Help us personalize your learning experience</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-accent-200 dark:bg-dark-muted text-accent-500 dark:text-accent-400'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep ? 'bg-primary-500' : 'bg-accent-200 dark:bg-dark-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-accent-100 dark:bg-dark-muted border border-accent-200 dark:border-dark-surface rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-accent-800 dark:text-accent-100 transition-all duration-300"
                  placeholder="How would you like to be called?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-accent-100 dark:bg-dark-muted border border-accent-200 dark:border-dark-surface rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-accent-800 dark:text-accent-100 transition-all duration-300 resize-none"
                  placeholder="Tell us a bit about yourself and your academic interests..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-4">
                  Academic Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {academicLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setProfileData(prev => ({ ...prev, academic_level: level.value as any }))}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                        profileData.academic_level === level.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-accent-200 dark:border-dark-surface hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{level.icon}</span>
                        <span className="font-medium text-accent-800 dark:text-accent-100">{level.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Subjects */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-6">Subjects of Interest</h2>
              <p className="text-accent-600 dark:text-accent-400 mb-6">Select the subjects you're studying or interested in learning about:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => handleSubjectToggle(subject)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center ${
                      profileData.subjects_of_interest.includes(subject)
                        ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                        : 'border-accent-200 dark:border-dark-surface hover:border-secondary-300 dark:hover:border-secondary-600 text-accent-700 dark:text-accent-300'
                    }`}
                  >
                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{subject}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Learning Goals */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-6">Learning Goals</h2>
              <p className="text-accent-600 dark:text-accent-400 mb-6">What are you hoping to achieve with StudyAI?</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {learningGoals.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      profileData.learning_goals.includes(goal)
                        ? 'border-highlight-500 bg-highlight-50 dark:bg-highlight-900/30 text-highlight-700 dark:text-highlight-300'
                        : 'border-accent-200 dark:border-dark-surface hover:border-highlight-300 dark:hover:border-highlight-600 text-accent-700 dark:text-accent-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5" />
                      <span className="font-medium">{goal}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-100 mb-6">Learning Preferences</h2>
              <p className="text-accent-600 dark:text-accent-400 mb-6">How would you prefer to receive explanations?</p>
              
              <div className="space-y-4">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setProfileData(prev => ({ ...prev, preferred_difficulty: level.value as any }))}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      profileData.preferred_difficulty === level.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-accent-200 dark:border-dark-surface hover:border-primary-300 dark:hover:border-primary-600'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <GraduationCap className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-accent-800 dark:text-accent-100 mb-1">{level.label}</h3>
                        <p className="text-accent-600 dark:text-accent-400 text-sm">{level.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-accent-200 dark:border-dark-muted">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-accent-100 dark:bg-dark-muted text-accent-700 dark:text-accent-300 rounded-2xl hover:bg-accent-200 dark:hover:bg-dark-surface transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && !profileData.display_name}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !profileData.display_name}
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Complete Setup</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;