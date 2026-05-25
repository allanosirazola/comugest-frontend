import { api } from './client';

export async function getBudgetComparison(communityId, year) {
  const { data } = await api.get(`/communities/${communityId}/budget/comparison`, { params: { year } });
  return data;
}
