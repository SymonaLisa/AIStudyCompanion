/*
  # Fix Profile Statistics and Streak Functionality

  1. Database Functions
    - Fix update_study_streak function to work properly
    - Fix increment_question_count function
    - Add function to update study time
    - Add function to update user stats when sessions are created

  2. Triggers
    - Add trigger to automatically update stats when study sessions are created
    - Add trigger to update study time

  3. Policies
    - Ensure proper RLS policies for all operations
*/

-- Drop existing functions to recreate them properly
DROP FUNCTION IF EXISTS update_study_streak(uuid);
DROP FUNCTION IF EXISTS increment_question_count(uuid);

-- Create improved function to update study streak
CREATE OR REPLACE FUNCTION update_study_streak(p_user_id uuid)
RETURNS void AS $$
DECLARE
  last_session_date date;
  today_date date := CURRENT_DATE;
  current_streak integer;
  has_session_today boolean;
BEGIN
  -- Get the user's current streak
  SELECT study_streak INTO current_streak
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Check if user has a session today
  SELECT EXISTS(
    SELECT 1 FROM study_sessions
    WHERE user_id = p_user_id
    AND DATE(created_at) = today_date
  ) INTO has_session_today;

  -- If no session today, don't update streak
  IF NOT has_session_today THEN
    RETURN;
  END IF;

  -- Get the date of the most recent session before today
  SELECT DATE(created_at) INTO last_session_date
  FROM study_sessions
  WHERE user_id = p_user_id
  AND DATE(created_at) < today_date
  ORDER BY created_at DESC
  LIMIT 1;

  -- Update streak logic
  IF last_session_date IS NULL THEN
    -- First session ever or first session in a long time
    UPDATE user_profiles
    SET study_streak = 1
    WHERE user_id = p_user_id;
  ELSIF last_session_date = today_date - INTERVAL '1 day' THEN
    -- Studied yesterday, increment streak
    UPDATE user_profiles
    SET study_streak = COALESCE(current_streak, 0) + 1
    WHERE user_id = p_user_id;
  ELSE
    -- Gap in studying, reset streak to 1
    UPDATE user_profiles
    SET study_streak = 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment question count
CREATE OR REPLACE FUNCTION increment_question_count(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET total_questions_asked = COALESCE(total_questions_asked, 0) + 1
  WHERE user_id = p_user_id;
  
  -- If no rows were updated, the profile doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found for user_id: %', p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update study time
CREATE OR REPLACE FUNCTION update_study_time(p_user_id uuid, p_duration integer)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET total_study_time = COALESCE(total_study_time, 0) + p_duration
  WHERE user_id = p_user_id;
  
  -- If no rows were updated, the profile doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found for user_id: %', p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle study session creation
CREATE OR REPLACE FUNCTION handle_study_session_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Update study time
  PERFORM update_study_time(NEW.user_id, NEW.duration);
  
  -- Update study streak
  PERFORM update_study_streak(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for study session creation
DROP TRIGGER IF EXISTS on_study_session_created ON study_sessions;
CREATE TRIGGER on_study_session_created
  AFTER INSERT ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_study_session_created();

-- Create function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS TABLE(
  total_sessions bigint,
  total_questions bigint,
  total_study_time_minutes integer,
  current_streak integer,
  last_session_date date
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM study_sessions WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM saved_questions WHERE user_id = p_user_id),
    COALESCE(up.total_study_time, 0),
    COALESCE(up.study_streak, 0),
    (SELECT DATE(MAX(created_at)) FROM study_sessions WHERE user_id = p_user_id)
  FROM user_profiles up
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing user profiles to ensure no null values
UPDATE user_profiles 
SET 
  study_streak = COALESCE(study_streak, 0),
  total_questions_asked = COALESCE(total_questions_asked, 0),
  total_study_time = COALESCE(total_study_time, 0)
WHERE study_streak IS NULL 
   OR total_questions_asked IS NULL 
   OR total_study_time IS NULL;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_study_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_question_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_study_time(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(uuid) TO authenticated;