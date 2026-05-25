import { api } from './client';

export const listDocuments = (communityId) =>
  api.get(`/communities/${communityId}/documents`).then((r) => r.data);

export const createDocument = (communityId, input) =>
  api.post(`/communities/${communityId}/documents`, input).then((r) => r.data);

export const updateDocument = (communityId, id, input) =>
  api.patch(`/communities/${communityId}/documents/${id}`, input).then((r) => r.data);

export const deleteDocument = (communityId, id) =>
  api.delete(`/communities/${communityId}/documents/${id}`);

export const listMyDocuments = () =>
  api.get('/me/documents').then((r) => r.data);
