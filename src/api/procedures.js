import { api } from './client';

export const PROCEDURE_TYPES = [
  'CERTIFICATE',
  'MAINTENANCE',
  'DOCUMENT_REQUEST',
  'COMPLAINT',
  'PERMISSION',
  'OTHER',
];
export const PROCEDURE_STATUSES = [
  'SUBMITTED',
  'IN_REVIEW',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
];

export async function createProcedure(input) {
  const { data } = await api.post('/procedures', input);
  return data.procedure;
}

export async function listMyProcedures() {
  const { data } = await api.get('/me/procedures');
  return data.procedures;
}

export async function listCommunityProcedures(communityId, filter = {}) {
  const { data } = await api.get(`/communities/${communityId}/procedures`, { params: filter });
  return data.procedures;
}

export async function getProcedure(id) {
  const { data } = await api.get(`/procedures/${id}`);
  return data.procedure;
}

export async function updateProcedure(id, input) {
  const { data } = await api.patch(`/procedures/${id}`, input);
  return data.procedure;
}

export async function addProcedureUpdate(id, body) {
  const { data } = await api.post(`/procedures/${id}/updates`, { body });
  return data.update;
}
