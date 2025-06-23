import React, { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import AuthModal from './components/AuthModal';
import ProfileSetup from './components/ProfileSetup';
import UserProfile from './components/UserProfile';
import { authService } from './services/authService';
import { UserProfile as UserProfileType } from './types/user';

function App() {
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Apply dark mode class to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Initialize auth state
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Get current user
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Get user profile
        const profile = await authService.getProfile(currentUser.id);
        setUserProfile(profile);
        
        // If user exists but no profile, show profile setup
        if (!profile) {
          setShowProfileSetup(true);
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }

    // Listen for auth changes
    authService.onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        const profile = await authService.getProfile(user.id);
        setUserProfile(profile);
        if (!profile) {
          setShowProfileSetup(true);
        }
      } else {
        setUserProfile(null);
        setShowProfileSetup(false);
        setShowProfile(false);
        setShowChat(false);
      }
    });
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleStartStudying = (subject?: string) => {
    if (subject) {
      setSelectedSubject(subject);
    }
    
    if (user && userProfile) {
      setShowChat(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleBackToHome = () => {
    setShowChat(false);
    setShowProfile(false);
    setSelectedSubject(null);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Auth state change will be handled by the listener
  };

  const handleProfileComplete = (profile: UserProfileType) => {
    setUserProfile(profile);
    setShowProfileSetup(false);
    setShowChat(true);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setShowChat(false);
      setShowProfile(false);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-surface flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-xl"></div>
          </div>
          <p className="text-accent-600 dark:text-accent-400">Loading StudyAI...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup && user) {
    return (
      <ProfileSetup
        userId={user.id}
        onComplete={handleProfileComplete}
        darkMode={darkMode}
      />
    );
  }

  if (showProfile && userProfile) {
    return (
      <UserProfile
        profile={userProfile}
        onProfileUpdate={setUserProfile}
        onBack={handleBackToHome}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-surface transition-colors duration-500">
      {showChat ? (
        <ChatInterface 
          onBack={handleBackToHome} 
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          user={user}
          userProfile={userProfile}
          onShowProfile={() => setShowProfile(true)}
          onSignOut={handleSignOut}
          selectedSubject={selectedSubject}
        />
      ) : (
        <LandingPage 
          onStartStudying={handleStartStudying}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          user={user}
          userProfile={userProfile}
          onShowProfile={() => setShowProfile(true)}
          onSignOut={handleSignOut}
          onShowAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        darkMode={darkMode}
      />
    </div>
  );
}

export default App;