import { api } from './client';

// ─── Communities ────────────────────────────────────────────

export async function listCommunities() {
  const { data } = await api.get('/communities');
  return data.communities;
}

export async function listMyCommunities() {
  const { data } = await api.get('/me/communities');
  return data.communities;
}

export async function getCommunity(id) {
  const { data } = await api.get(`/communities/${id}`);
  return data.community;
}

export async function createCommunity(input) {
  const { data } = await api.post('/communities', input);
  return data.community;
}

export async function updateCommunity(id, input) {
  const { data } = await api.patch(`/communities/${id}`, input);
  return data.community;
}

export async function deleteCommunity(id) {
  await api.delete(`/communities/${id}`);
}

// ─── Units ──────────────────────────────────────────────────

export async function listUnits(communityId) {
  const { data } = await api.get(`/communities/${communityId}/units`);
  return data.units;
}

export async function createUnit(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/units`, input);
  return data.unit;
}

export async function updateUnit(unitId, input) {
  const { data } = await api.patch(`/units/${unitId}`, input);
  return data.unit;
}

export async function deleteUnit(unitId) {
  await api.delete(`/units/${unitId}`);
}
