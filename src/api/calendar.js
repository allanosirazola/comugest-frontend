import { api } from './client';

export const getCommunityCalendar = (communityId, params) =>
  api.get(`/communities/${communityId}/calendar`, { params }).then((r) => r.data);

export const getMyCalendar = (params) =>
  api.get('/me/calendar', { params }).then((r) => r.data);

export function getIcalUrl(communityId) {
  const base = import.meta.env.VITE_API_URL || '/api/v1';
  return `${base}/communities/${communityId}/calendar.ics`;
}
