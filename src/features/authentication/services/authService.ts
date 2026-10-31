import { request, type ApiResponse } from '../../../services/api-client';
import type { AuthUserResponse, LoginCredentials } from '../types/auth.types';

export const authService = {
  /**
   * Authenticate staff credentials
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: AuthUserResponse }>> {
    const res = await request<ApiResponse<{ token: string; user: AuthUserResponse }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    const token = res.data?.token || (res as any).token;
    const user = res.data?.user || (res as any).user;

    if (token) {
      sessionStorage.setItem('brgy_staff_token', token);
    }
    if (user) {
      sessionStorage.setItem('brgy_staff_authenticated', 'true');
      sessionStorage.setItem('brgy_staff_user', user.username);
      sessionStorage.setItem('brgy_staff_role', user.role);
    }

    return res;
  },

  /**
   * Sign out and clear active session
   */
  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      sessionStorage.removeItem('brgy_staff_token');
      sessionStorage.removeItem('brgy_staff_authenticated');
      sessionStorage.removeItem('brgy_staff_user');
      sessionStorage.removeItem('brgy_staff_role');
    }
  },

  /**
   * Verify active session
   */
  async getMe(): Promise<ApiResponse<{ user: AuthUserResponse }>> {
    return request<ApiResponse<{ user: AuthUserResponse }>>('/auth/me');
  }
};

