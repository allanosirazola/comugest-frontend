import { api } from './client';
import type { Expense, ExpensesResult, ExpenseCategory } from '@/types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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

export interface CreateExpenseInput {
  category: ExpenseCategory;
  concept: string;
  description?: string | null;
  amount: number;
  expenseDate: string; // ISO
  supplier?: string | null;
  attachmentUrl?: string | null;
}

export interface ExpenseFilter {
  from?: string;
  to?: string;
  category?: ExpenseCategory;
}

export async function listCommunityExpenses(communityId: string, filter: ExpenseFilter = {}): Promise<ExpensesResult> {
  const { data } = await api.get<ExpensesResult>(`/communities/${communityId}/expenses`, { params: filter });
  return data;
}

export async function createExpense(communityId: string, input: CreateExpenseInput): Promise<Expense> {
  const { data } = await api.post<{ expense: Expense }>(`/communities/${communityId}/expenses`, input);
  return data.expense;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}

export async function listMyExpenses(communityId: string, filter: ExpenseFilter = {}): Promise<ExpensesResult> {
  const { data } = await api.get<ExpensesResult>('/me/expenses', { params: { communityId, ...filter } });
  return data;
}
