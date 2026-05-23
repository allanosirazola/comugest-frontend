import { api } from './client';

export async function getProfile() {
  const { data } = await api.get('/me/profile');
  return data.user;
}

export async function updateProfile(input) {
  const { data } = await api.patch('/me/profile', input);
  return data.user;
}

export async function changePassword(input) {
  await api.post('/me/profile/change-password', input);
}

export async function listMyReservations() {
  const { data } = await api.get('/me/reservations');
  return data.reservations;
}

export async function listMyMeetings() {
  const { data } = await api.get('/me/meetings');
  return data.meetings;
}

export async function setup2FA() {
  const { data } = await api.post('/me/profile/2fa/setup');
  return data; // { secret, otpauthUrl, qrCode (data URI) }
}

export async function verify2FA(token) {
  const { data } = await api.post('/me/profile/2fa/verify', { token });
  return data;
}

export async function disable2FA(token) {
  const { data } = await api.post('/me/profile/2fa/disable', { token });
  return data;
}
