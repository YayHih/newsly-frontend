/**
 * Newsly API Client
 * Secure, type-safe API client for the Newsly backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  picture_url?: string;
  primary_interests?: string[];
  secondary_interests?: string[];
  email_verified: boolean;
}

export interface UserProfile {
  name?: string;
  email?: string;
  age_range?: string;
  education_level?: string;
  field_of_study?: string;
  secondary_field?: string;
  year_in_program?: number;
  career_stage?: string;
  target_industries?: string[];
  primary_interests?: string[];
  secondary_interests?: string[];
  academic_subjects?: string[];
  hobbies?: string[];
  topics_to_avoid?: string[];
  preferred_complexity?: string;
  preferred_article_length?: string;
  news_frequency?: string;
  preferred_content_types?: string[];
  political_orientation?: string;
  international_focus?: boolean;
  local_focus?: boolean;
  breaking_news_priority?: boolean;
  reading_time_preference?: string;
  device_preference?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  email: string;
}

export interface Recommendation {
  id: number;
  article_id: number;
  relevance_score: number;
  recommendation_reason: string | null;
  article_title: string | null;
  article_source: string | null;
  article_url: string | null;
  article_description: string | null;
  created_at: string;
  published_at: string | null;
}

export interface UserStats {
  total_recommendations: number;
  served_count: number;
  clicked_count: number;
  avg_relevance_score: number;
  last_recommendation_at: string | null;
  click_through_rate: number;
}

// API Client
export const api = {
  // Authentication
  async verifyPassword(password: string): Promise<{ valid: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Password verification failed');
    }
    return res.json();
  },

  async register(email: string, name: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Login failed');
    }
    return res.json();
  },

  async getCurrentUser(token: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to get user');
    }
    return res.json();
  },

  async updateProfile(token: string, profile: UserProfile): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update profile');
    }
    return res.json();
  },

  // Google OAuth
  getGoogleLoginUrl(): string {
    return `${API_BASE}/auth/google`;
  },

  // Recommendations
  async getRecommendations(token: string, page = 1, limit = 20): Promise<Recommendation[]> {
    const res = await fetch(
      `${API_BASE}/recommendations?page=${page}&limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to fetch recommendations');
    }
    return res.json();
  },

  async generateRecommendations(token: string): Promise<{ message: string; count: number }> {
    const res = await fetch(`${API_BASE}/recommendations/generate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to generate recommendations');
    }
    return res.json();
  },

  // Interactions
  async recordInteraction(
    token: string,
    articleId: number,
    type: 'view' | 'click' | 'like' | 'share' | 'hide' | 'bookmark',
    timeSpent?: number,
    position?: number
  ): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/interactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        article_id: articleId,
        interaction_type: type,
        time_spent_seconds: timeSpent || 0,
        position_in_feed: position
      })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to record interaction');
    }
    return res.json();
  },

  // Stats
  async getUserStats(token: string): Promise<UserStats> {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to fetch stats');
    }
    return res.json();
  },

  // Health check
  async health(): Promise<{ status: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('API is not healthy');
    return res.json();
  }
};

// Helper to store/retrieve token
export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('newsly-token');
  },

  set(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('newsly-token', token);
  },

  remove(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('newsly-token');
  }
};

// Helper to store/retrieve user
export const userStorage = {
  get(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('newsly-user');
    return data ? JSON.parse(data) : null;
  },

  set(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('newsly-user', JSON.stringify(user));
  },

  remove(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('newsly-user');
  }
};
