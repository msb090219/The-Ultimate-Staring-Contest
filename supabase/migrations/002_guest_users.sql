-- ============================================================================
-- Enable Guest Users for Leaderboard (Simpler Approach)
-- ============================================================================

-- Step 1: Drop all existing policies that depend on user_id
DROP POLICY IF EXISTS "Authenticated users can insert scores" ON scores;
DROP POLICY IF EXISTS "Public can view scores" ON scores;
DROP POLICY IF EXISTS "Users cannot update or delete scores" ON scores;

-- Step 2: Drop the trigger and function (we'll recreate a simpler version)
DROP TRIGGER IF EXISTS on_score_insert ON scores;
DROP FUNCTION IF EXISTS handle_score_submission();

-- Step 3: Make user_id nullable in scores table (guests can have NULL user_id)
ALTER TABLE scores ALTER COLUMN user_id DROP NOT NULL;

-- Step 4: Drop the foreign key constraint since we now allow NULL
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_user_id_fkey;

-- Step 5: Create simplified trigger (only creates profile for authenticated users)
CREATE OR REPLACE FUNCTION handle_score_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create/update user profile for authenticated users (not guests)
  IF NEW.user_id IS NOT NULL THEN
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_score_insert
  BEFORE INSERT ON scores
  FOR EACH ROW
  EXECUTE FUNCTION handle_score_submission();

-- Step 6: Create new policies

-- Scores: Public can view (for leaderboard)
CREATE POLICY "Public can view scores"
  ON scores FOR SELECT
  USING (TRUE);

-- Scores: Authenticated users can insert for themselves, anyone can insert guest scores (user_id IS NULL)
CREATE POLICY "Users and guests can insert scores"
  ON scores FOR INSERT
  WITH CHECK (
    -- Authenticated users inserting for themselves
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Guests (user_id is NULL)
    (user_id IS NULL)
  );

-- Scores: No one can update or delete
CREATE POLICY "Users cannot update or delete scores"
  ON scores FOR ALL
  USING (FALSE);
