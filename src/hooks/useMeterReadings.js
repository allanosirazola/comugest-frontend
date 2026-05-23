import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/meterReadings';

export function useMeterReadings(communityId, params) {
  return useQuery({
    queryKey: ['meter-readings', communityId, params],
    queryFn: () => api.listReadings(communityId, params),
    enabled: !!communityId,
  });
}

export function useCreateReading(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createReading(communityId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meter-readings', communityId] }),
  });
}

export function useDeleteReading(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteReading(communityId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meter-readings', communityId] }),
  });
}
