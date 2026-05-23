import { api } from './client';

export async function importCsv(communityId, rows) {
  const { data } = await api.post(`/communities/${communityId}/import/csv`, { rows });
  return data; // { created, invited, errors }
}
