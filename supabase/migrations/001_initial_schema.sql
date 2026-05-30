-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  game_name TEXT DEFAULT 'Anonymous',
  best_time FLOAT,
  games_played INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores Table
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  time_seconds FLOAT NOT NULL CHECK (time_seconds >= 0),
  is_disqualified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scores_time ON scores(time_seconds DESC) WHERE is_disqualified = FALSE;
CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_created ON scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_best ON user_profiles(best_time DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle score submission and update user profile
CREATE OR REPLACE FUNCTION handle_score_submission()
RETURNS TRIGGER AS $$
DECLARE
  current_best FLOAT;
BEGIN
  -- Get current best time for user
  SELECT best_time INTO current_best
  FROM user_profiles
  WHERE id = NEW.user_id;

  -- Update user profile
  INSERT INTO user_profiles (id, game_name, best_time, games_played)
  VALUES (NEW.user_id, NEW.game_name, NEW.time_seconds, 1)
  ON CONFLICT (id) DO UPDATE SET
    game_name = EXCLUDED.game_name,
    best_time = GREATEST(
      COALESCE(user_profiles.best_time, 0),
      NEW.time_seconds
    ),
    games_played = user_profiles.games_played + 1,
    updated_at = NOW();

  -- Keep only the best score per user
  IF current_best IS NOT NULL AND NEW.time_seconds < current_best THEN
    -- New score is not better, don't insert
    RETURN NULL;
  END IF;

  IF current_best IS NOT NULL THEN
    -- Delete old best score
    DELETE FROM scores
    WHERE user_id = NEW.user_id
      AND time_seconds = current_best
      AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle score submission
CREATE TRIGGER on_score_insert
  BEFORE INSERT ON scores
  FOR EACH ROW
  EXECUTE FUNCTION handle_score_submission();

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Scores Policies
CREATE POLICY "Public can view scores"
  ON scores FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can insert scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update or delete scores"
  ON scores FOR ALL
  USING (FALSE);
