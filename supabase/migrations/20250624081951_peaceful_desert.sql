/*
  # Add Missing Database Functions

  1. Database Functions
    - `get_user_stats(user_id_param uuid)` - Returns aggregated user statistics
    - `refresh_user_profile_stats(user_id_param uuid)` - Refreshes and returns updated profile
    - `update_study_streak(user_id_param uuid)` - Updates study streak
    - `increment_question_count(user_id_param uuid)` - Increments question count
    - `update_study_time(user_id_param uuid, duration_param integer)` - Updates study time
    - `calculate_study_streak(user_id_param uuid)` - Calculates current study streak
    - Trigger functions for automatic stat updates

  2. Security
    - Grant execute permissions to authenticated users
    - Functions use SECURITY DEFINER for proper access
*/

-- Create function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id_param uuid)
RETURNS TABLE (
    total_sessions bigint,
    total_questions bigint,
    total_study_time_minutes bigint,
    current_streak integer,
    last_session_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE((SELECT COUNT(*) FROM public.study_sessions WHERE user_id = user_id_param), 0)::bigint AS total_sessions,
        COALESCE((SELECT COUNT(*) FROM public.saved_questions WHERE user_id = user_id_param), 0)::bigint AS total_questions,
        COALESCE((SELECT SUM(duration) FROM public.study_sessions WHERE user_id = user_id_param), 0)::bigint AS total_study_time_minutes,
        COALESCE((SELECT study_streak FROM public.user_profiles WHERE user_id = user_id_param), 0)::integer AS current_streak,
        (SELECT MAX(created_at)::date FROM public.study_sessions WHERE user_id = user_id_param) AS last_session_date;
END;
$$;

-- Create function to calculate study streak
CREATE OR REPLACE FUNCTION public.calculate_study_streak(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_dates date[];
    current_streak integer := 0;
    i integer;
    today_date date := CURRENT_DATE;
BEGIN
    -- Get all unique session dates in descending order
    SELECT ARRAY(
        SELECT DISTINCT DATE(created_at)
        FROM public.study_sessions
        WHERE user_id = user_id_param
        ORDER BY DATE(created_at) DESC
    ) INTO session_dates;
    
    -- If no sessions, streak is 0
    IF array_length(session_dates, 1) IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Start from the most recent date
    FOR i IN 1..array_length(session_dates, 1) LOOP
        -- Check if this date continues the streak
        IF i = 1 THEN
            -- First date should be today or yesterday to have an active streak
            IF session_dates[i] = today_date OR session_dates[i] = today_date - INTERVAL '1 day' THEN
                current_streak := 1;
            ELSE
                -- No recent activity, streak is 0
                RETURN 0;
            END IF;
        ELSE
            -- Check if this date is consecutive to the previous one
            IF session_dates[i] = session_dates[i-1] - INTERVAL '1 day' THEN
                current_streak := current_streak + 1;
            ELSE
                -- Gap found, stop counting
                EXIT;
            END IF;
        END IF;
    END LOOP;
    
    RETURN current_streak;
END;
$$;

-- Create function to update study streak
CREATE OR REPLACE FUNCTION public.update_study_streak(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_streak integer;
BEGIN
    -- Calculate the current streak
    SELECT public.calculate_study_streak(user_id_param) INTO new_streak;
    
    -- Update the user profile
    UPDATE public.user_profiles
    SET 
        study_streak = new_streak,
        updated_at = now()
    WHERE user_id = user_id_param;
END;
$$;

-- Create function to increment question count
CREATE OR REPLACE FUNCTION public.increment_question_count(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        total_questions_asked = COALESCE(total_questions_asked, 0) + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
    
    -- If no rows were updated, the profile doesn't exist
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found for user_id: %', user_id_param;
    END IF;
END;
$$;

-- Create function to update study time
CREATE OR REPLACE FUNCTION public.update_study_time(user_id_param uuid, duration_param integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        total_study_time = COALESCE(total_study_time, 0) + duration_param,
        updated_at = now()
    WHERE user_id = user_id_param;
    
    -- If no rows were updated, the profile doesn't exist
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found for user_id: %', user_id_param;
    END IF;
END;
$$;

-- Create function to refresh user profile stats
CREATE OR REPLACE FUNCTION public.refresh_user_profile_stats(user_id_param uuid)
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats_record RECORD;
    updated_profile public.user_profiles;
BEGIN
    -- Get current stats
    SELECT * INTO stats_record FROM public.get_user_stats(user_id_param);
    
    -- Update the user profile with current stats
    UPDATE public.user_profiles
    SET 
        total_questions_asked = stats_record.total_questions::integer,
        total_study_time = stats_record.total_study_time_minutes::integer,
        study_streak = stats_record.current_streak,
        updated_at = now()
    WHERE user_id = user_id_param
    RETURNING * INTO updated_profile;
    
    RETURN updated_profile;
END;
$$;

-- Create trigger function for study sessions
CREATE OR REPLACE FUNCTION public.handle_study_session_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update study time
    UPDATE public.user_profiles
    SET 
        total_study_time = COALESCE(total_study_time, 0) + NEW.duration,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Update study streak
    PERFORM public.update_study_streak(NEW.user_id);
    
    RETURN NEW;
END;
$$;

-- Create trigger function for saved questions
CREATE OR REPLACE FUNCTION public.handle_question_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Increment question count
    UPDATE public.user_profiles
    SET 
        total_questions_asked = COALESCE(total_questions_asked, 0) + 1,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$;

-- Create triggers (drop existing ones first to avoid conflicts)
DROP TRIGGER IF EXISTS on_study_session_created ON public.study_sessions;
CREATE TRIGGER on_study_session_created
    AFTER INSERT ON public.study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_study_session_created();

DROP TRIGGER IF EXISTS on_question_created ON public.saved_questions;
CREATE TRIGGER on_question_created
    AFTER INSERT ON public.saved_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_question_created();

-- Ensure all existing profiles have proper default values
UPDATE public.user_profiles 
SET 
    study_streak = COALESCE(study_streak, 0),
    total_questions_asked = COALESCE(total_questions_asked, 0),
    total_study_time = COALESCE(total_study_time, 0),
    updated_at = now()
WHERE study_streak IS NULL 
   OR total_questions_asked IS NULL 
   OR total_study_time IS NULL;

-- Recalculate all user streaks to ensure accuracy
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT user_id FROM public.user_profiles LOOP
        PERFORM public.update_study_streak(user_record.user_id);
    END LOOP;
END $$;

-- Grant necessary permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_user_profile_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_study_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_study_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_question_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_study_time(uuid, integer) TO authenticated;

-- Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON public.study_sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_saved_questions_user_date ON public.saved_questions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);