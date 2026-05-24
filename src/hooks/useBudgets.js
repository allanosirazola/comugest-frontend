import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import * as budgetApi from '@/api/budget';

export function useBudget(communityId, year) {
  return useQuery({
    queryKey: ['budgets', communityId, year],
    queryFn: () => api.get(`/communities/${communityId}/budgets/${year}`).then(r => r.data),
    retry: false,
  });
}

export function useUpsertBudget(communityId, year) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put(`/communities/${communityId}/budgets/${year}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', communityId] }),
  });
}

export function useBudgetComparison(communityId, year) {
  return useQuery({
    queryKey: ['budget-comparison', communityId, year],
    queryFn: () => budgetApi.getBudgetComparison(communityId, year),
    enabled: !!(communityId && year),
  });
}
