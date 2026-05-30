-- ============================================================================
-- Fix Auth Score Submission
-- ============================================================================

-- Drop all existing policies on scores
DROP POLICY IF EXISTS "Authenticated users and guests can insert scores" ON scores;
DROP POLICY IF EXISTS "Public can view scores" ON scores;
DROP POLICY IF EXISTS "No score updates or deletes" ON scores;
DROP POLICY IF EXISTS "Users cannot update or delete scores" ON scores;

-- Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Users and guests can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users and guests can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users and guests can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Ensure guest_identifier column exists
ALTER TABLE scores ADD COLUMN IF NOT EXISTS guest_identifier TEXT;

-- Simple working policies for scores
CREATE POLICY "Enable read access for all users"
  ON scores FOR SELECT
  USING (TRUE);

CREATE POLICY "Enable insert for authenticated users"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for guests"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

CREATE POLICY "Disable updates and deletes"
  ON scores FOR ALL
  USING (FALSE);

-- Simple working policies for user_profiles
CREATE POLICY "Enable read for own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
