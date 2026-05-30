import { createClient } from '@supabase/supabase-js';
import { sanitizePlayerName } from '../lib/utils/validation.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables. Please check .env.local and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
  constructor() {
    this.client = supabase;
    this.submissionHistory = new Map(); // Track submissions per user
  }

  // Leaderboard operations
  async getTopScores(limit = 10) {
    try {
      // Get all scores, then dedupe client-side to show only best per person
      const { data, error } = await this.client
        .from('scores')
        .select('*')
        .eq('is_disqualified', false)
        .order('time_seconds', { ascending: false });

      if (error) throw error;

      // Dedupe: keep only best score per user/guest
      const bestScores = [];
      const seen = new Set();

      for (const score of (data || [])) {
        const key = score.user_id || score.guest_identifier;
        if (!seen.has(key)) {
          seen.add(key);
          bestScores.push(score);
        }

        if (bestScores.length >= limit) break;
      }

      return { success: true, data: bestScores };
    } catch (error) {
      console.error('Failed to fetch top scores:', error);
      return { success: false, error: error.message };
    }
  }

  async getPreviewScores(limit = 5) {
    return await this.getTopScores(limit);
  }

  async getUserCentricLeaderboard(userId, guestIdentifier, contextSize = 2) {
    try {
      // Get all non-disqualified scores ordered by time
      const { data, error } = await this.client
        .from('scores')
        .select('*')
        .eq('is_disqualified', false)
        .order('time_seconds', { ascending: false });

      if (error) throw error;

      // Dedupe: keep only best score per user/guest
      const bestScores = [];
      const seen = new Set();

      for (const score of (data || [])) {
        const key = score.user_id || score.guest_identifier;
        if (!seen.has(key)) {
          seen.add(key);
          bestScores.push(score);
        }
      }

      // Find user's rank - match by user_id OR guest_identifier
      let userRank = -1;
      let userScore = null;

      for (let i = 0; i < bestScores.length; i++) {
        const score = bestScores[i];
        // Match if user_id matches, OR if guest_identifier matches (handles sign-in after playing as guest)
        const userMatch = userId && score.user_id === userId;
        const guestMatch = guestIdentifier && score.guest_identifier === guestIdentifier;

        if (userMatch || guestMatch) {
          userRank = i + 1;
          userScore = score;
          console.log('[Supabase] Found user score:', {
            rank: userRank,
            score: score,
            matchedBy: userMatch ? 'user_id' : 'guest_identifier'
          });
          break;
        }
      }

      console.log('[Supabase] User-centric lookup:', {
        userId,
        guestIdentifier,
        userRank,
        userScore: userScore?.time_seconds
      });

      // If user not found, return top scores as fallback
      if (userRank === -1) {
        return {
          success: true,
          data: {
            userRank: null,
            userScore: null,
            scores: bestScores.slice(0, contextSize * 2 + 1),
            totalPlayers: bestScores.length,
            startIndex: 1
          }
        };
      }

      // Get scores around user's rank
      const startIndex = Math.max(0, userRank - contextSize - 1);
      const endIndex = Math.min(bestScores.length, userRank + contextSize);
      const contextScores = bestScores.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          userRank,
          userScore,
          scores: contextScores,
          totalPlayers: bestScores.length,
          startIndex: startIndex + 1 // Display rank of first item
        }
      };
    } catch (error) {
      console.error('Failed to fetch user-centric leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  async submitScore(userId, guestIdentifier, gameName, timeSeconds) {
    try {
      // Validate time value
      if (typeof timeSeconds !== 'number' || isNaN(timeSeconds) || timeSeconds < 0 || timeSeconds > 3600) {
        return { success: false, error: 'Invalid time. Time must be between 0 and 3600 seconds.' };
      }

      // Rate limiting: Max 5 submissions per minute per user/guest
      const identifier = userId || guestIdentifier;
      const now = Date.now();
      const userHistory = this.submissionHistory.get(identifier) || [];
      const recentSubmissions = userHistory.filter(time => now - time < 60000);

      if (recentSubmissions.length >= 5) {
        return { success: false, error: 'Too many submissions. Please wait a moment before trying again.' };
      }

      recentSubmissions.push(now);
      this.submissionHistory.set(identifier, recentSubmissions);

      const sanitizedName = sanitizePlayerName(gameName);

      // First, get the user's current best score
      let query = this.client
        .from('scores')
        .select('time_seconds')
        .eq('is_disqualified', false);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('guest_identifier', guestIdentifier);
      }

      const { data: existingScores } = await query
        .order('time_seconds', { ascending: false })
        .limit(1);

      const existingBest = existingScores?.[0]?.time_seconds || 0;
      const isNewBest = timeSeconds > existingBest;

      console.log('[Supabase] Saving score:', {
        newTime: timeSeconds,
        existingBest,
        isNewBest
      });

      // Just insert the score - simple!
      const insertData = {
        user_id: userId,
        guest_identifier: guestIdentifier,
        game_name: sanitizedName,
        time_seconds: timeSeconds,
        is_disqualified: false
      };

      const { data, error } = await this.client
        .from('scores')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[Supabase] Insert failed:', error);
        throw error;
      }

      console.log('[Supabase] Score saved:', data);

      return {
        success: true,
        data,
        updated: true,
        better: isNewBest,
        message: isNewBest ? 'New personal best!' : `Your best: ${existingBest.toFixed(2)}s`
      };
    } catch (error) {
      console.error('Score submission failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserBestScore(userId) {
    try {
      const { data, error } = await this.client
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .eq('is_disqualified', false)
        .order('time_seconds', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return { success: true, data };
    } catch (error) {
      console.error('Failed to fetch user best score:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserDetailedStats(userId) {
    try {
      // Get all user's scores
      const { data: userScores, error } = await this.client
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .eq('is_disqualified', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get global leaderboard for rank calculation
      const globalResult = await this.getTopScores(10000); // Get all scores for accurate ranking
      const allScores = globalResult.success ? globalResult.data : [];
      const totalPlayers = allScores.length;

      // Calculate statistics
      const gamesPlayed = userScores?.length || 0;
      const bestTime = userScores?.[0]?.time_seconds || 0;

      let averageTime = 0;
      let totalTimeSurvived = 0;

      if (gamesPlayed > 0) {
        totalTimeSurvived = userScores.reduce((sum, score) => sum + score.time_seconds, 0);
        averageTime = totalTimeSurvived / gamesPlayed;
      }

      // Find global rank
      let globalRank = null;
      if (bestTime > 0) {
        for (let i = 0; i < allScores.length; i++) {
          if (allScores[i].user_id === userId) {
            globalRank = i + 1;
            break;
          }
        }
      }

      // Calculate percentile
      let percentile = 0;
      if (globalRank && totalPlayers > 0) {
        percentile = ((totalPlayers - globalRank + 1) / totalPlayers) * 100;
      }

      // Get recent games (last 10)
      const recentGames = userScores?.slice(0, 10) || [];

      return {
        success: true,
        data: {
          gamesPlayed,
          bestTime,
          averageTime,
          totalTimeSurvived,
          globalRank,
          totalPlayers,
          percentile,
          recentGames,
          allScores: userScores || []
        }
      };
    } catch (error) {
      console.error('Failed to fetch detailed user stats:', error);
      return { success: false, error: error.message };
    }
  }

  // User profile operations
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return { success: false, error: error.message };
    }
  }

  async updateGameName(userId, gameName) {
    const sanitizedName = sanitizePlayerName(gameName);
    return await this.updateUserProfile(userId, { game_name: sanitizedName });
  }

  async incrementGamesPlayed(userId) {
    try {
      // First, get current games_played count
      const { data: profile } = await this.getUserProfile(userId);

      const currentGamesPlayed = profile?.games_played || 0;

      const { data, error } = await this.client
        .from('user_profiles')
        .upsert({
          id: userId,
          games_played: currentGamesPlayed + 1,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Failed to increment games played:', error);
      return { success: false, error: error.message };
    }
  }

  // Test function to verify database connection - can be called from browser console
  async testConnection() {
    console.log('[Supabase] Testing connection...');

    try {
      // Test 1: Check if scores table exists and get all scores
      const { data: allScores, error: scoresError } = await this.client
        .from('scores')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (scoresError) {
        console.error('[Supabase] Scores table error:', scoresError);
        return { success: false, error: 'Scores table not accessible: ' + scoresError.message };
      }

      console.log('[Supabase] ✓ Scores table exists!');
      console.log('[Supabase] All scores (latest 20):', allScores);

      // Test 2: Check top scores
      const { data: topScores, error: fetchError } = await this.getTopScores(10);

      if (fetchError) {
        console.error('[Supabase] Fetch error:', fetchError);
        return { success: false, error: 'Cannot fetch scores: ' + fetchError.error };
      }

      console.log('[Supabase] ✓ Top 10 scores:', topScores);

      // Group by user/guest to show best scores per person
      const byUser = {};
      allScores?.forEach(score => {
        const key = score.user_id || score.guest_identifier;
        if (!byUser[key] || score.time_seconds > byUser[key].time_seconds) {
          byUser[key] = score;
        }
      });

      console.log('[Supabase] Best score per user:', Object.values(byUser));

      return {
        success: true,
        allScores: allScores || [],
        topScores: topScores || [],
        byUser: Object.values(byUser)
      };
    } catch (error) {
      console.error('[Supabase] Test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const supabaseService = new SupabaseService();

// Expose test function to browser console for debugging
if (typeof window !== 'undefined') {
  window.testSupabase = () => supabaseService.testConnection();
  console.log('[Supabase] Test function available: window.testSupabase()');
}
