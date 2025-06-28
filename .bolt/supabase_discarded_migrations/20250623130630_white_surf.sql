/*
  # Create user profiles and study tracking system

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `display_name` (text)
      - `bio` (text, optional)
      - `academic_level` (text)
      - `subjects_of_interest` (text array)
      - `learning_goals` (text array)
      - `study_streak` (integer)
      - `total_questions_asked` (integer)
      - `total_study_time` (integer)
      - `preferred_difficulty` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `study_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `subject` (text)
      - `duration` (integer, minutes)
      - `questions_count` (integer)
      - `created_at` (timestamp)
    
    - `saved_questions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `question` (text)
      - `answer` (text)
      - `subject` (text)
      - `sources` (text array)
      - `is_bookmarked` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - Helper functions for updating user stats
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio text,
  academic_level text NOT NULL DEFAULT 'undergraduate',
  subjects_of_interest text[] DEFAULT '{}',
  learning_goals text[] DEFAULT '{}',
  study_streak integer DEFAULT 0,
  total_questions_asked integer DEFAULT 0,
  total_study_time integer DEFAULT 0,
  preferred_difficulty text DEFAULT 'intermediate',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  subject text NOT NULL,
  duration integer DEFAULT 0,
  questions_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create saved_questions table
CREATE TABLE IF NOT EXISTS saved_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  subject text NOT NULL DEFAULT 'General',
  sources text[] DEFAULT '{}',
  is_bookmarked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for study_sessions
CREATE POLICY "Users can view own study sessions"
  ON study_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON study_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
  ON study_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for saved_questions
CREATE POLICY "Users can view own saved questions"
  ON saved_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved questions"
  ON saved_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved questions"
  ON saved_questions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved questions"
  ON saved_questions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update user_profiles updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create function to update study streak
CREATE OR REPLACE FUNCTION update_study_streak(user_id uuid)
RETURNS void AS $$
DECLARE
  last_session_date date;
  current_date date := CURRENT_DATE;
  current_streak integer;
BEGIN
  -- Get the user's current streak
  SELECT study_streak INTO current_streak
  FROM user_profiles
  WHERE user_profiles.user_id = update_study_streak.user_id;

  -- Get the date of the last study session
  SELECT DATE(created_at) INTO last_session_date
  FROM study_sessions
  WHERE study_sessions.user_id = update_study_streak.user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Update streak logic
  IF last_session_date IS NULL THEN
    -- First session ever
    UPDATE user_profiles
    SET study_streak = 1
    WHERE user_profiles.user_id = update_study_streak.user_id;
  ELSIF last_session_date = current_date THEN
    -- Already studied today, no change needed
    RETURN;
  ELSIF last_session_date = current_date - INTERVAL '1 day' THEN
    -- Studied yesterday, increment streak
    UPDATE user_profiles
    SET study_streak = current_streak + 1
    WHERE user_profiles.user_id = update_study_streak.user_id;
  ELSE
    -- Gap in studying, reset streak
    UPDATE user_profiles
    SET study_streak = 1
    WHERE user_profiles.user_id = update_study_streak.user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment question count
CREATE OR REPLACE FUNCTION increment_question_count(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET total_questions_asked = total_questions_asked + 1
  WHERE user_profiles.user_id = increment_question_count.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;