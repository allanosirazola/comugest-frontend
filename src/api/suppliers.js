import { api } from './client';

export const listSuppliers = (communityId) =>
  api.get(`/communities/${communityId}/suppliers`).then((r) => r.data);

export const getSupplier = (communityId, id) =>
  api.get(`/communities/${communityId}/suppliers/${id}`).then((r) => r.data);

export const createSupplier = (communityId, input) =>
  api.post(`/communities/${communityId}/suppliers`, input).then((r) => r.data);

export const updateSupplier = (communityId, id, input) =>
  api.patch(`/communities/${communityId}/suppliers/${id}`, input).then((r) => r.data);

export const deleteSupplier = (communityId, id) =>
  api.delete(`/communities/${communityId}/suppliers/${id}`);
