-- ============================================================================
-- Add guest tracking and ensure one score per person
-- ============================================================================

-- Add guest_identifier column for tracking guests across sessions
ALTER TABLE scores ADD COLUMN IF NOT EXISTS guest_identifier TEXT;

-- Create index for guest lookups
CREATE INDEX IF NOT EXISTS idx_scores_guest_identifier ON scores(guest_identifier) WHERE guest_identifier IS NOT NULL;

-- Drop old policies
DROP POLICY IF EXISTS "Users and guests can insert scores" ON scores;
DROP POLICY IF EXISTS "Users cannot update or delete scores" ON scores;

-- New policy: Allow inserts for authenticated users (with user_id) or guests (with guest_identifier)
CREATE POLICY "Authenticated users and guests can insert scores"
  ON scores FOR INSERT
  WITH CHECK (
    -- Authenticated users: user_id matches their auth uid
    (auth.uid() IS NOT NULL AND auth.uid() = user_id AND guest_identifier IS NULL)
    OR
    -- Guests: must have guest_identifier, user_id is NULL
    (user_id IS NULL AND guest_identifier IS NOT NULL AND guest_identifier LIKE 'guest_%')
  );

-- No one can update or delete scores (prevents manual manipulation)
CREATE POLICY "No score updates or deletes"
  ON scores FOR ALL
  USING (FALSE);

-- Update the trigger to handle guest tracking and keep only best scores
CREATE OR REPLACE FUNCTION handle_score_submission()
RETURNS TRIGGER AS $$
DECLARE
  existing_score_id TEXT;
  existing_best_time FLOAT;
BEGIN
  -- Handle authenticated users
  IF NEW.user_id IS NOT NULL THEN
    -- Get their current best score
    SELECT id, time_seconds INTO existing_score_id, existing_best_time
    FROM scores
    WHERE user_id = NEW.user_id
      AND is_disqualified = FALSE
    ORDER BY time_seconds DESC
    LIMIT 1;

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

    -- If they have an existing score
    IF existing_score_id IS NOT NULL THEN
      -- If new score is worse, don't insert (keep the better one)
      IF NEW.time_seconds <= existing_best_time THEN
        RETURN NULL;
      END IF;

      -- New score is better - delete the old one
      DELETE FROM scores WHERE id = existing_score_id;
    END IF;

  -- Handle guests
  ELSE
    -- Get their current best score by guest_identifier
    SELECT id, time_seconds INTO existing_score_id, existing_best_time
    FROM scores
    WHERE guest_identifier = NEW.guest_identifier
      AND is_disqualified = FALSE
    ORDER BY time_seconds DESC
    LIMIT 1;

    -- If guest has an existing score
    IF existing_score_id IS NOT NULL THEN
      -- If new score is worse, don't insert (keep the better one)
      IF NEW.time_seconds <= existing_best_time THEN
        RETURN NULL;
      END IF;

      -- New score is better - delete the old one
      DELETE FROM scores WHERE id = existing_score_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_score_insert ON scores;
CREATE TRIGGER on_score_insert
  BEFORE INSERT ON scores
  FOR EACH ROW
  EXECUTE FUNCTION handle_score_submission();
