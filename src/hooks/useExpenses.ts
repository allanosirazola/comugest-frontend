import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/expenses';

const KEYS = {
  all: ['expenses'] as const,
  community: (id: string, filter: api.ExpenseFilter) => ['expenses', 'community', id, filter] as const,
  mine: (id: string, filter: api.ExpenseFilter) => ['expenses', 'mine', id, filter] as const,
};

export function useCommunityExpenses(communityId: string | undefined, filter: api.ExpenseFilter = {}) {
  return useQuery({
    queryKey: communityId ? KEYS.community(communityId, filter) : KEYS.all,
    queryFn: () => api.listCommunityExpenses(communityId!, filter),
    enabled: !!communityId,
  });
}

export function useMyExpenses(communityId: string | undefined, filter: api.ExpenseFilter = {}) {
  return useQuery({
    queryKey: communityId ? KEYS.mine(communityId, filter) : KEYS.all,
    queryFn: () => api.listMyExpenses(communityId!, filter),
    enabled: !!communityId,
  });
}

export function useCreateExpense(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: api.CreateExpenseInput) => api.createExpense(communityId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteExpense,
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
