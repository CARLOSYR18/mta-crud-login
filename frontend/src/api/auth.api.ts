import { apiClient } from './client';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: string;
  provider: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export async function registerRequest(name: string, email: string, password: string) {
  const { data } = await apiClient.post<{ message: string }>('/auth/register', { name, email, password });
  return data;
}

export async function loginRequest(email: string, password: string) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function logoutRequest(refreshToken: string) {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function verifyEmailRequest(token: string) {
  const { data } = await apiClient.get<{ message: string }>('/auth/verify-email', { params: { token } });
  return data;
}

export async function resendVerificationRequest(email: string) {
  const { data } = await apiClient.post<{ message: string }>('/auth/resend-verification', { email });
  return data;
}