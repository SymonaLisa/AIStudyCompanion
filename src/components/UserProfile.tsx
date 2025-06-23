import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit3, 
  BookOpen, 
  Target, 
  Calendar, 
  TrendingUp, 
  Award,
  Clock,
  MessageCircle,
  Save,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { UserProfile as UserProfileType, StudySession, SavedQuestion } from '../types/user';
import { authService } from '../services/authService';
import { userDataService } from '../services/userDataService';
import Navigation from './Navigation';
import ProfilePictureUpload from './ProfilePictureUpload';

interface UserProfileProps {
  profile: UserProfileType;
  onProfileUpdate: (profile: UserProfileType) => void;
  onBack: () => void;
  darkMode: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, onProfileUpdate, onBack, darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<SavedQuestion[]>([]);
  const [showPictureUpload, setShowPictureUpload] = useState(false);
  const [userStats, setUserStats] = useState({
    total_sessions: 0,
    total_questions: 0,
    total_study_time_minutes: 0,
    current_streak: 0,
    last_session_date: null
  });
  
  const [editData, setEditData] = useState({
    display_name: profile.display_name,
    bio: profile.bio || '',
    subjects_of_interest: profile.subjects_of_interest,
    learning_goals: profile.learning_goals,
    preferred_difficulty: profile.preferred_difficulty
  });

  useEffect(() => {
    loadUserData();
  }, [profile.user_id]);

  // Update edit data when profile changes
  useEffect(() => {
    setEditData({
      display_name: profile.display_name,
      bio: profile.bio || '',
      subjects_of_interest: profile.subjects_of_interest,
      learning_goals: profile.learning_goals,
      preferred_difficulty: profile.preferred_difficulty
    });
  }, [profile]);

  const loadUserData = async () => {
    try {
      const [sessions, questions, stats] = await Promise.all([
        userDataService.getStudySessions(profile.user_id, 5),
        userDataService.getSavedQuestions(profile.user_id, 5),
        userDataService.getUserStats(profile.user_id)
      ]);
      
      setStudySessions(sessions);
      setRecentQuestions(questions);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set default values on error
      setStudySessions([]);
      setRecentQuestions([]);
      setUserStats({
        total_sessions: 0,
        total_questions: 0,
        total_study_time_minutes: 0,
        current_streak: 0,
        last_session_date: null
      });
    }
  };

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      // Refresh user profile with latest stats
      const updatedProfile = await userDataService.refreshUserProfile(profile.user_id);
      if (updatedProfile) {
        onProfileUpdate(updatedProfile);
      }
      
      // Reload all data
      await loadUserData();
    } catch (error) {
      console.error('Error refreshing stats:', error);
      // Still try to reload data even if refresh fails
      await loadUserData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedProfile = await authService.updateProfile(editData);
      onProfileUpdate(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      display_name: profile.display_name,
      bio: profile.bio || '',
      subjects_of_interest: profile.subjects_of_interest,
      learning_goals: profile.learning_goals,
      preferred_difficulty: profile.preferred_difficulty
    });
    setIsEditing(false);
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    try {
      const updatedProfile = await authService.updateAvatar(profile.user_id, avatarUrl);
      onProfileUpdate(updatedProfile);
      setShowPictureUpload(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300';
      case 'intermediate': return 'bg-highlight-100 text-highlight-700 dark:bg-highlight-900/30 dark:text-highlight-300';
      case 'advanced': return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';
      default: return 'bg-accent-100 text-accent-700 dark:bg-accent-700 dark:text-accent-300';
    }
  };

  // Use the most up-to-date stats (prioritize userStats from database)
  const displayStats = {
    streak: Math.max(userStats.current_streak || 0, profile.study_streak || 0),
    questions: Math.max(userStats.total_questions || 0, profile.total_questions_asked || 0),
    studyTime: Math.max(userStats.total_study_time_minutes || 0, profile.total_study_time || 0),
    sessions: userStats.total_sessions || 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-surface transition-colors duration-500">
      {/* Navigation */}
      <Navigation
        onBack={onBack}
        onHome={onBack}
        showBack={true}
        showHome={true}
        title="User Profile"
        darkMode={darkMode}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Profile Header */}
        <div className="bg-accent-50 dark:bg-dark-surface rounded-3xl p-8 shadow-lg border border-accent-200 dark:border-dark-muted transition-all duration-500">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              <div className="relative group">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-20 h-20 rounded-3xl object-cover shadow-lg border-4 border-accent-200 dark:border-dark-muted"
                    onError={(e) => {
                      // Fallback to default avatar if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                
                {/* Default Avatar (shown if no avatar_url or image fails) */}
                <div className={`w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-lg ${profile.avatar_url ? 'hidden' : ''}`}>
                  <User className="w-10 h-10 text-white" />
                </div>
                
                {/* Edit Picture Button */}
                <button
                  onClick={() => setShowPictureUpload(!showPictureUpload)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                  title="Change profile picture"
                >
                  <Edit3 className="w-4 h-4 text-white" />
                </button>
              </div>

              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.display_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                    className="text-2xl font-bold bg-accent-100 dark:bg-dark-muted border border-accent-200 dark:border-dark-surface rounded-xl px-4 py-2 text-accent-800 dark:text-accent-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-accent-800 dark:text-accent-100">{profile.display_name}</h1>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(profile.preferred_difficulty)}`}>
                    {profile.preferred_difficulty.charAt(0).toUpperCase() + profile.preferred_difficulty.slice(1)} Level
                  </span>
                  <span className="text-accent-600 dark:text-accent-400 text-sm">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={refreshStats}
                disabled={isRefreshing}
                className="p-3 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-800/40 transition-all duration-300 disabled:opacity-50"
                title="Refresh statistics"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="p-3 bg-accent-100 dark:bg-dark-muted text-accent-700 dark:text-accent-300 rounded-xl hover:bg-accent-200 dark:hover:bg-dark-surface transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-3 bg-accent-100 dark:bg-dark-muted text-accent-700 dark:text-accent-300 rounded-xl hover:bg-accent-200 dark:hover:bg-dark-surface transition-all duration-300"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Picture Upload */}
          {showPictureUpload && (
            <div className="mb-8 p-6 bg-accent-100 dark:bg-dark-muted rounded-2xl border border-accent-200 dark:border-dark-surface">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-100">Update Profile Picture</h3>
                <button
                  onClick={() => setShowPictureUpload(false)}
                  className="p-2 hover:bg-accent-200 dark:hover:bg-dark-surface rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5 text-accent-600 dark:text-accent-300" />
                </button>
              </div>
              <ProfilePictureUpload
                userId={profile.user_id}
                currentAvatarUrl={profile.avatar_url}
                onAvatarUpdate={handleAvatarUpdate}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* Bio */}
          <div className="mb-6">
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full bg-accent-100 dark:bg-dark-muted border border-accent-200 dark:border-dark-surface rounded-xl px-4 py-3 text-accent-800 dark:text-accent-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            ) : (
              <p className="text-accent-600 dark:text-accent-400 leading-relaxed">
                {profile.bio || 'No bio provided yet.'}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-2xl font-bold text-accent-800 dark:text-accent-100">{displayStats.streak}</div>
              <div className="text-sm text-accent-600 dark:text-accent-400">Day Streak</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="text-2xl font-bold text-accent-800 dark:text-accent-100">{displayStats.questions}</div>
              <div className="text-sm text-accent-600 dark:text-accent-400">Questions Asked</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-highlight-100 dark:bg-highlight-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
              </div>
              <div className="text-2xl font-bold text-accent-800 dark:text-accent-100">{formatDuration(displayStats.studyTime)}</div>
              <div className="text-sm text-accent-600 dark:text-accent-400">Study Time</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-200 dark:bg-accent-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-accent-700 dark:text-accent-200" />
              </div>
              <div className="text-2xl font-bold text-accent-800 dark:text-accent-100">{displayStats.sessions}</div>
              <div className="text-sm text-accent-600 dark:text-accent-400">Sessions</div>
            </div>
          </div>
        </div>

        {/* Subjects & Goals */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Subjects */}
          <div className="bg-accent-50 dark:bg-dark-surface rounded-3xl p-6 shadow-lg border border-accent-200 dark:border-dark-muted transition-all duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-100">Subjects of Interest</h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {profile.subjects_of_interest.map((subject, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl text-sm font-medium"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div className="bg-accent-50 dark:bg-dark-surface rounded-3xl p-6 shadow-lg border border-accent-200 dark:border-dark-muted transition-all duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-100">Learning Goals</h2>
            </div>
            
            <div className="space-y-3">
              {profile.learning_goals.map((goal, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span className="text-accent-700 dark:text-accent-300">{goal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Sessions */}
          <div className="bg-accent-50 dark:bg-dark-surface rounded-3xl p-6 shadow-lg border border-accent-200 dark:border-dark-muted transition-all duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
              <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-100">Recent Sessions</h2>
            </div>
            
            <div className="space-y-4">
              {studySessions.length > 0 ? (
                studySessions.map((session) => (
                  <div key={session.id} className="p-4 bg-accent-100 dark:bg-dark-muted rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-accent-800 dark:text-accent-100">{session.title}</h3>
                      <span className="text-xs text-accent-500 dark:text-accent-400">
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-accent-600 dark:text-accent-400">
                      <span>{session.subject}</span>
                      <span>•</span>
                      <span>{formatDuration(session.duration)}</span>
                      <span>•</span>
                      <span>{session.questions_count} questions</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-accent-600 dark:text-accent-400 text-center py-8">No study sessions yet</p>
              )}
            </div>
          </div>

          {/* Recent Questions */}
          <div className="bg-accent-50 dark:bg-dark-surface rounded-3xl p-6 shadow-lg border border-accent-200 dark:border-dark-muted transition-all duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <MessageCircle className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-100">Recent Questions</h2>
            </div>
            
            <div className="space-y-4">
              {recentQuestions.length > 0 ? (
                recentQuestions.map((question) => (
                  <div key={question.id} className="p-4 bg-accent-100 dark:bg-dark-muted rounded-2xl">
                    <p className="font-medium text-accent-800 dark:text-accent-100 mb-2 line-clamp-2">
                      {question.question}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded-lg">
                        {question.subject}
                      </span>
                      <span className="text-accent-500 dark:text-accent-400">
                        {new Date(question.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-accent-600 dark:text-accent-400 text-center py-8">No questions asked yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;