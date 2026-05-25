import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/unitNotes';

export function useUnitNotes(unitId) {
  return useQuery({
    queryKey: ['unit-notes', unitId],
    queryFn: () => api.listUnitNotes(unitId),
    enabled: !!unitId,
  });
}

export function useAddUnitNote(unitId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content) => api.addUnitNote(unitId, content),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['unit-notes', unitId] }),
  });
}

export function useDeleteUnitNote(unitId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId) => api.deleteUnitNote(unitId, noteId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['unit-notes', unitId] }),
  });
}
