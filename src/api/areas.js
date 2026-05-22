import { api } from './client';

export async function listAreas(communityId) {
  const { data } = await api.get(`/communities/${communityId}/areas`);
  return data;
}

export async function createArea(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/areas`, input);
  return data.area;
}

export async function updateArea(id, input) {
  const { data } = await api.patch(`/areas/${id}`, input);
  return data.area;
}

export async function deleteArea(id) {
  await api.delete(`/areas/${id}`);
}

export async function listReservations(areaId, date) {
  const { data } = await api.get(`/areas/${areaId}/reservations`, { params: { date } });
  return data;
}

export async function createReservation(areaId, input) {
  const { data } = await api.post(`/areas/${areaId}/reservations`, input);
  return data.reservation;
}

export async function cancelReservation(id) {
  await api.delete(`/areas/reservations/${id}`);
}
