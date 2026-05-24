import { api } from './client';

export async function getUnitDelinquencyHistory(communityId, unitId) {
  const { data } = await api.get(`/communities/${communityId}/units/${unitId}/delinquency`);
  return data.history;
}

export async function getOwnershipHistory(communityId, unitId) {
  const { data } = await api.get(`/communities/${communityId}/units/${unitId}/ownership-history`);
  return data.ownerships ?? data;
}
