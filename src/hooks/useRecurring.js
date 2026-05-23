import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/recurring';

const KEYS = {
  all: (communityId) => ['recurring', communityId],
};

export function useRecurring(communityId) {
  return useQuery({
    queryKey: KEYS.all(communityId),
    queryFn: () => api.listRecurring(communityId),
    enabled: !!communityId,
  });
}

export function useCreateRecurring(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createRecurring(communityId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all(communityId) }),
  });
}

export function useUpdateRecurring(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => api.updateRecurring(communityId, id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all(communityId) }),
  });
}

export function useTriggerRecurring(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.triggerRecurring(communityId, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all(communityId) });
      void qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
