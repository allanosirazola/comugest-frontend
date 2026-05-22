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

export function useReservations(areaId, date) {
  return useQuery({
    queryKey: ['reservations', areaId, date],
    queryFn: () => api.listReservations(areaId, date),
    enabled: !!areaId && !!date,
  });
}

export function useCreateReservation(areaId, date) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createReservation(areaId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['reservations', areaId, date] }),
  });
}

export function useCancelReservation(areaId, date) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.cancelReservation(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['reservations', areaId, date] }),
  });
}
