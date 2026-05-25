import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/documents';

export function useDocuments(communityId) {
  return useQuery({
    queryKey: ['documents', communityId],
    queryFn: () => api.listDocuments(communityId),
    enabled: !!communityId,
  });
}

export function useCreateDocument(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createDocument(communityId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', communityId] }),
  });
}

export function useUpdateDocument(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }) => api.updateDocument(communityId, id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', communityId] }),
  });
}

export function useDeleteDocument(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteDocument(communityId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', communityId] }),
  });
}

export function useMyDocuments() {
  return useQuery({ queryKey: ['my-documents'], queryFn: api.listMyDocuments });
}
