import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/coAdmins';

export function useCoAdmins(communityId) {
  return useQuery({
    queryKey: ['co-admins', communityId],
    queryFn: () => api.listCoAdmins(communityId),
    enabled: !!communityId,
  });
}

export function useAddCoAdmin(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email) => api.addCoAdmin(communityId, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['co-admins', communityId] }),
  });
}

export function useRemoveCoAdmin(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) => api.removeCoAdmin(communityId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['co-admins', communityId] }),
  });
}
