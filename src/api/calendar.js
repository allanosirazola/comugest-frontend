import { api } from './client';

export const getCommunityCalendar = (communityId, params) =>
  api.get(`/communities/${communityId}/calendar`, { params }).then((r) => r.data);

export const getMyCalendar = (params) =>
  api.get('/me/calendar', { params }).then((r) => r.data);
