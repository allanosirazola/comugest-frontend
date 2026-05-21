import { api } from './client';
import type { AuthResponse, RegisterResponse, User } from '@/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'VECINO' | 'ADMIN_FINCAS';
  locale: 'es' | 'en';
  gdprAccepted: true;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>('/auth/register', input);
  return data;
}

export async function verifyEmail(token: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/verify-email', { token });
  return data;
}

export async function resendVerification(email: string): Promise<void> {
  await api.post('/auth/resend-verification', { email });
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', { token, password });
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}
