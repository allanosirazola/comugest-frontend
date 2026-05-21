import { api } from './client';
import type { Announcement } from '@/types';

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  pinned?: boolean;
  notify?: boolean;
}

export async function listCommunityAnnouncements(communityId: string): Promise<Announcement[]> {
  const { data } = await api.get<{ announcements: Announcement[] }>(
    `/communities/${communityId}/announcements`
  );
  return data.announcements;
}

export async function createAnnouncement(communityId: string, input: CreateAnnouncementInput): Promise<Announcement> {
  const { data } = await api.post<{ announcement: Announcement }>(
    `/communities/${communityId}/announcements`,
    input
  );
  return data.announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await api.delete(`/announcements/${id}`);
}

export async function listMyAnnouncements(): Promise<Announcement[]> {
  const { data } = await api.get<{ announcements: Announcement[] }>('/me/announcements');
  return data.announcements;
}
