import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/suppliers';

export function useSuppliers(communityId) {
  return useQuery({
    queryKey: ['suppliers', communityId],
    queryFn: () => api.listSuppliers(communityId),
    enabled: !!communityId,
  });
}

export function useCreateSupplier(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createSupplier(communityId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers', communityId] }),
  });
}

export function useUpdateSupplier(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }) => api.updateSupplier(communityId, id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers', communityId] }),
  });
}

export function useDeleteSupplier(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteSupplier(communityId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers', communityId] }),
  });
}
