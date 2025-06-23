export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  academic_level: 'high_school' | 'undergraduate' | 'graduate' | 'professional' | 'other';
  subjects_of_interest: string[];
  learning_goals: string[];
  study_streak: number;
  total_questions_asked: number;
  total_study_time: number;
  preferred_difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  duration: number;
  questions_count: number;
  created_at: string;
}

export interface SavedQuestion {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  subject: string;
  sources: string[];
  is_bookmarked: boolean;
  created_at: string;
}