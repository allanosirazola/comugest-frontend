import { api } from './client';

export async function listRecurring(communityId) {
  const { data } = await api.get(`/communities/${communityId}/recurring`);
  return data;
}

export async function createRecurring(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/recurring`, input);
  return data;
}

export async function updateRecurring(communityId, id, input) {
  const { data } = await api.patch(`/communities/${communityId}/recurring/${id}`, input);
  return data;
}

export async function triggerRecurring(communityId, id) {
  const { data } = await api.post(`/communities/${communityId}/recurring/${id}/trigger`);
  return data;
}
