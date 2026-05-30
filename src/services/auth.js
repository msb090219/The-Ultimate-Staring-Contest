import { supabase } from './supabase.js';
import { authState } from '../stores/authState.js';
import { supabaseService } from './supabase.js';
import { MESSAGES } from '../lib/constants/messages.js';

export class AuthService {
  constructor() {
    this.client = supabase;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Check for existing session
    const { data: { session } } = await this.client.auth.getSession();

    if (session) {
      await this.handleSession(session);
    }

    // Listen for auth changes
    this.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        this.handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        authState.logout();
      }
    });

    this.initialized = true;
  }

  async handleSession(session) {
    if (!session?.user) {
      authState.setUser(null, null);
      return;
    }

    // Get or create user profile
    const { data: profile } = await supabaseService.getUserProfile(session.user.id);

    // Check if game_name is in auth user metadata (from sign up)
    const metadataGameName = session.user.user_metadata?.game_name;

    // Use profile game_name, or metadata game_name, or default to 'Anonymous'
    let gameName = profile?.game_name || metadataGameName || 'Anonymous';

    // If profile exists but has no game_name, and we have it from metadata, update it
    if (profile && !profile.game_name && metadataGameName) {
      await supabaseService.updateGameName(session.user.id, metadataGameName);
    }

    const user = {
      id: session.user.id,
      email: session.user.email,
      game_name: gameName,
      provider: session.user.app_metadata?.provider || 'email'
    };

    authState.setUser(user, session);
  }

  async signInWithGoogle() {
    authState.setLoading(true);

    try {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;

      // Redirect will happen automatically
      return { success: true };
    } catch (error) {
      console.error('Google sign-in failed:', error);
      authState.setError(MESSAGES.auth.oauthFailed);
      authState.setLoading(false);
      return { success: false, error: error.message };
    }
  }

  async signInWithEmail(email, password) {
    authState.setLoading(true);

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Email sign-in failed:', error);
      authState.setError(MESSAGES.auth.oauthFailed);
      authState.setLoading(false);
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email, password, gameName) {
    authState.setLoading(true);

    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            game_name: gameName || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Email sign-up failed:', error);
      authState.setError(MESSAGES.auth.oauthFailed);
      authState.setLoading(false);
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    authState.setLoading(true);

    try {
      const { error } = await this.client.auth.signOut();

      if (error) throw error;

      authState.logout();
      authState.setLoading(false);

      return { success: true };
    } catch (error) {
      console.error('Sign out failed:', error);
      authState.setError(MESSAGES.auth.networkError);
      authState.setLoading(false);
      return { success: false, error: error.message };
    }
  }

  async updateGameName(gameName) {
    const user = $authState.user;

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    authState.setLoading(true);

    try {
      const result = await supabaseService.updateGameName(user.id, gameName);

      if (result.success) {
        authState.updateGameName(gameName);
      }

      authState.setLoading(false);

      return result;
    } catch (error) {
      console.error('Failed to update game name:', error);
      authState.setError(MESSAGES.auth.networkError);
      authState.setLoading(false);
      return { success: false, error: error.message };
    }
  }

  isAuthenticated() {
    return $authState.isAuthenticated;
  }

  getUser() {
    return $authState.user;
  }

  getSession() {
    return $authState.session;
  }
}

export const authService = new AuthService();
