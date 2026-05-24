import { api } from './client';

export async function listIncidents(communityId) {
  const { data } = await api.get(`/communities/${communityId}/incidents`);
  return data.incidents ?? [];
}

export async function createIncident(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/incidents`, input);
  return data.incident;
}

export async function updateIncidentStatus(communityId, incidentId, input) {
  const { data } = await api.patch(`/communities/${communityId}/incidents/${incidentId}`, input);
  return data.incident;
}

export const addIncidentPhoto = (communityId, incidentId, dataUri) =>
  api.post(`/communities/${communityId}/incidents/${incidentId}/photos`, { dataUri }).then(r => r.data);

export const removeIncidentPhoto = (communityId, incidentId, photoIndex) =>
  api.delete(`/communities/${communityId}/incidents/${incidentId}/photos/${photoIndex}`).then(r => r.data);
