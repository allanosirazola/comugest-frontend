import { api } from './client';

export async function listNotifications() {
  const { data } = await api.get('/me/notifications');
  return data.notifications;
}

export async function markNotificationRead(id) {
  await api.patch(`/me/notifications/${id}/read`);
}

export async function markAllRead() {
  await api.patch('/me/notifications/read-all');
}
