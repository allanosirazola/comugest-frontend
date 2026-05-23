import { api } from './client';

export async function getMyWaitlist() {
  const { data } = await api.get('/me/waitlist');
  return data.entries ?? [];
}

export async function joinWaitlist(areaId, startTime, endTime) {
  const { data } = await api.post(`/me/waitlist`, { areaId, startTime, endTime });
  return data;
}

export async function leaveWaitlist(entryId) {
  await api.delete(`/me/waitlist/${entryId}`);
}
