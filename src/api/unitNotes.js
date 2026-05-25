import { api } from './client';

export async function listUnitNotes(unitId) {
  const { data } = await api.get(`/units/${unitId}/notes`);
  return data.notes;
}

export async function addUnitNote(unitId, content) {
  const { data } = await api.post(`/units/${unitId}/notes`, { content });
  return data.note;
}

export async function deleteUnitNote(unitId, noteId) {
  await api.delete(`/units/${unitId}/notes/${noteId}`);
}
