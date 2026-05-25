import { api } from './client';

export const listReadings = (communityId, params = {}) =>
  api.get(`/communities/${communityId}/meter-readings`, { params }).then((r) => r.data);

export const createReading = (communityId, input) =>
  api.post(`/communities/${communityId}/meter-readings`, input).then((r) => r.data);

export const deleteReading = (communityId, id) =>
  api.delete(`/communities/${communityId}/meter-readings/${id}`);
