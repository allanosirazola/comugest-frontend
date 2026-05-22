import { api } from './client';

export const EXPENSE_CATEGORIES = [
  'CLEANING',
  'LIFT',
  'GARBAGE',
  'GARDENING',
  'MAINTENANCE',
  'INSURANCE',
  'ELECTRICITY',
  'WATER',
  'SECURITY',
  'ADMIN_FEES',
  'SUPPLIES',
  'OTHER',
];

export async function listCommunityExpenses(communityId, filter = {}) {
  const { data } = await api.get(`/communities/${communityId}/expenses`, { params: filter });
  return data;
}

export async function createExpense(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/expenses`, input);
  return data.expense;
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}

export async function listMyExpenses(communityId, filter = {}) {
  const { data } = await api.get('/me/expenses', { params: { communityId, ...filter } });
  return data;
}
