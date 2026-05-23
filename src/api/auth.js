import { api } from './client';

export async function login(input) {
  const { data } = await api.post('/auth/login', input);
  return data;
}

export async function login2fa(preAuthToken, totpCode) {
  const { data } = await api.post('/auth/login/2fa', { preAuthToken, totpCode });
  return data;
}

export async function register(input) {
  const { data } = await api.post('/auth/register', input);
  return data;
}

export async function verifyEmail(token) {
  const { data } = await api.post('/auth/verify-email', { token });
  return data;
}

export async function resendVerification(email) {
  await api.post('/auth/resend-verification', { email });
}

export async function forgotPassword(email) {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token, password) {
  await api.post('/auth/reset-password', { token, password });
}

export async function logout(refreshToken) {
  await api.post('/auth/logout', { refreshToken });
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.user;
}
