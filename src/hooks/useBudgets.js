import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

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
