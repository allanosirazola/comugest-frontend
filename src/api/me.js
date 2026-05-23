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
