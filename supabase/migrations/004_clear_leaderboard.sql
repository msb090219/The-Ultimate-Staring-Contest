-- Clear all scores from the leaderboard
DELETE FROM scores;

-- Optional: Also reset user_profiles stats
UPDATE user_profiles SET
  best_time = NULL,
  games_played = 0,
  updated_at = NOW();
