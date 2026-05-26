import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/areas';

export function useAreas(communityId) {
  return useQuery({
    queryKey: ['areas', communityId],
    queryFn: () => api.listAreas(communityId),
    enabled: !!communityId,
  });
}

export function useCreateArea(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createArea(communityId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['areas', communityId] }),
  });
}

export function useUpdateArea(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => api.updateArea(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['areas', communityId] }),
  });
}

export function useDeleteArea(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteArea(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['areas', communityId] }),
  });
}

export function useReservations(communityId, areaId, date) {
  return useQuery({
    queryKey: ['reservations', communityId, areaId, date],
    queryFn: () => api.listReservations(communityId, areaId, date),
    enabled: !!communityId && !!areaId && !!date,
  });
}

export function useCreateReservation(communityId, areaId, date) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createReservation(communityId, areaId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['reservations', communityId, areaId, date] }),
  });
}

export function useCancelReservation(areaId, date) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.cancelReservation(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['reservations', areaId, date] }),
  });
}
