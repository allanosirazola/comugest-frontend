import { api } from './client';

export const listTemplates = (communityId) =>
  api.get(`/communities/${communityId}/templates`).then(r => r.data);

export const createTemplate = (communityId, data) =>
  api.post(`/communities/${communityId}/templates`, data).then(r => r.data);

export const deleteTemplate = (communityId, templateId) =>
  api.delete(`/communities/${communityId}/templates/${templateId}`).then(r => r.data);
