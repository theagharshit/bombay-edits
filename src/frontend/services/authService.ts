import { ApiClient } from './apiClient';

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isGuest: boolean;
  createdAt: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  isGuest: boolean;
  customer: CustomerProfile | null;
}

export interface AuthSuccessPayload {
  customer: CustomerProfile;
  token: string;
}

export class AuthService {
  /**
   * Register a new member account
   */
  public static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  }): Promise<AuthSuccessPayload> {
    return ApiClient.post<AuthSuccessPayload>('/api/auth/register', data);
  }

  /**
   * Log in with existing credentials
   */
  public static async login(data: {
    email: string;
    password: string;
  }): Promise<AuthSuccessPayload> {
    return ApiClient.post<AuthSuccessPayload>('/api/auth/login', data);
  }

  /**
   * Log out of current session
   */
  public static async logout(): Promise<void> {
    await ApiClient.post('/api/auth/logout');
  }

  /**
   * Get current authenticated profile or guest status
   */
  public static async getMe(): Promise<AuthStatusResponse> {
    return ApiClient.get<AuthStatusResponse>('/api/auth/me');
  }
}
