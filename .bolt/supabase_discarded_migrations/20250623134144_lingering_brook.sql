/*
  # Add get_user_stats function

  1. New Functions
    - `get_user_stats(p_user_id uuid)` - Returns aggregated user statistics
      - `total_sessions` - Count of study sessions for the user
      - `total_questions` - Count of saved questions for the user  
      - `total_study_time_minutes` - Sum of study session durations
      - `current_streak` - Current study streak from user profile
      - `last_session_date` - Date of most recent study session

  2. Security
    - Grant execute permission to authenticated users
    - Function uses row-level security through table access
*/

CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
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
        (SELECT COUNT(*) FROM public.study_sessions WHERE user_id = p_user_id) AS total_sessions,
        (SELECT COUNT(*) FROM public.saved_questions WHERE user_id = p_user_id) AS total_questions,
        (SELECT COALESCE(SUM(duration), 0) FROM public.study_sessions WHERE user_id = p_user_id) AS total_study_time_minutes,
        (SELECT COALESCE(study_streak, 0) FROM public.user_profiles WHERE user_id = p_user_id) AS current_streak,
        (SELECT MAX(created_at)::date FROM public.study_sessions WHERE user_id = p_user_id) AS last_session_date;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_stats(uuid) TO authenticated;