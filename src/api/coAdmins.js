import { api } from './client';

export const listCoAdmins = (communityId) =>
  api.get(`/communities/${communityId}/co-admins`).then((r) => r.data);

export const addCoAdmin = (communityId, email) =>
  api.post(`/communities/${communityId}/co-admins`, { email }).then((r) => r.data);

export const removeCoAdmin = (communityId, userId) =>
  api.delete(`/communities/${communityId}/co-admins/${userId}`);
