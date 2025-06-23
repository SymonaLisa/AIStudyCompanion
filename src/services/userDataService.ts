import { supabase } from './supabaseClient';
import { StudySession, SavedQuestion } from '../types/user';

export class UserDataService {
  async saveStudySession(session: Omit<StudySession, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    
    // The trigger will automatically update user stats
    return data;
  }

  async getStudySessions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async saveQuestion(question: Omit<SavedQuestion, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('saved_questions')
      .insert(question)
      .select()
      .single();

    if (error) throw error;
    
    // The trigger will automatically update user stats
    return data;
  }

  async getSavedQuestions(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('saved_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getBookmarkedQuestions(userId: string) {
    const { data, error } = await supabase
      .from('saved_questions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_bookmarked', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async toggleBookmark(questionId: string, isBookmarked: boolean) {
    const { data, error } = await supabase
      .from('saved_questions')
      .update({ is_bookmarked: isBookmarked })
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error getting user stats:', error);
        // Return default stats if function fails
        return {
          total_sessions: 0,
          total_questions: 0,
          total_study_time_minutes: 0,
          current_streak: 0,
          last_session_date: null
        };
      }

      // The function returns an array, get the first result
      const stats = data?.[0] || {
        total_sessions: 0,
        total_questions: 0,
        total_study_time_minutes: 0,
        current_streak: 0,
        last_session_date: null
      };

      return {
        total_sessions: Number(stats.total_sessions) || 0,
        total_questions: Number(stats.total_questions) || 0,
        total_study_time_minutes: Number(stats.total_study_time_minutes) || 0,
        current_streak: Number(stats.current_streak) || 0,
        last_session_date: stats.last_session_date
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return {
        total_sessions: 0,
        total_questions: 0,
        total_study_time_minutes: 0,
        current_streak: 0,
        last_session_date: null
      };
    }
  }

  async refreshUserProfile(userId: string) {
    try {
      // Use the database function to refresh stats
      const { data, error } = await supabase.rpc('refresh_user_profile_stats', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error refreshing profile stats:', error);
        // Fallback: get the profile directly
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError) throw profileError;
        return profileData;
      }

      return data;
    } catch (error) {
      console.error('Error in refreshUserProfile:', error);
      throw error;
    }
  }

  async updateStudyStreak(userId: string) {
    try {
      const { error } = await supabase.rpc('update_study_streak', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error updating study streak:', error);
      }
    } catch (error) {
      console.error('Error in updateStudyStreak:', error);
    }
  }

  async incrementQuestionCount(userId: string) {
    // This is now handled by the database trigger when a question is saved
    // But we can still call it manually if needed
    try {
      const { error } = await supabase.rpc('increment_question_count', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error incrementing question count:', error);
      }
    } catch (error) {
      console.error('Error in incrementQuestionCount:', error);
    }
  }

  async updateStudyTime(userId: string, duration: number) {
    // This is now handled by the database trigger when a session is saved
    // But we can still call it manually if needed
    try {
      const { error } = await supabase.rpc('update_study_time', {
        p_user_id: userId,
        p_duration: duration
      });

      if (error) {
        console.error('Error updating study time:', error);
      }
    } catch (error) {
      console.error('Error in updateStudyTime:', error);
    }
  }

  // Helper method to ensure user profile exists
  async ensureUserProfile(userId: string, userData: any) {
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            display_name: userData.display_name || 'Student',
            academic_level: userData.academic_level || 'undergraduate',
            subjects_of_interest: userData.subjects_of_interest || [],
            learning_goals: userData.learning_goals || [],
            preferred_difficulty: userData.preferred_difficulty || 'intermediate',
            study_streak: 0,
            total_questions_asked: 0,
            total_study_time: 0
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      return existingProfile;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      throw error;
    }
  }
}

export const userDataService = new UserDataService();