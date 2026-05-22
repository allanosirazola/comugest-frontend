import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/expenses';

const KEYS = {
  all: ['expenses'],
  community: (id, filter) => ['expenses', 'community', id, filter],
  mine: (id, filter) => ['expenses', 'mine', id, filter],
};

export function useCommunityExpenses(communityId, filter = {}) {
  return useQuery({
    queryKey: communityId ? KEYS.community(communityId, filter) : KEYS.all,
    queryFn: () => api.listCommunityExpenses(communityId, filter),
    enabled: !!communityId,
  });
}

export function useMyExpenses(communityId, filter = {}) {
  return useQuery({
    queryKey: communityId ? KEYS.mine(communityId, filter) : KEYS.all,
    queryFn: () => api.listMyExpenses(communityId, filter),
    enabled: !!communityId,
  });
}

export function useCreateExpense(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createExpense(communityId, input),
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
