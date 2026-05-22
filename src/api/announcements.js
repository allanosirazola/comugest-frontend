import { api } from './client';

export async function listCommunityAnnouncements(communityId) {
  const { data } = await api.get(`/communities/${communityId}/announcements`);
  return data.announcements;
}

export async function createAnnouncement(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/announcements`, input);
  return data.announcement;
}

export async function deleteAnnouncement(id) {
  await api.delete(`/announcements/${id}`);
}

export async function listMyAnnouncements() {
  const { data } = await api.get('/me/announcements');
  return data.announcements;
}
