import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/procedures';

const KEYS = {
  all: ['procedures'],
  mine: () => ['procedures', 'mine'],
  detail: (id) => ['procedures', 'detail', id],
  community: (id, filter) => ['procedures', 'community', id, filter],
};

export function useMyProcedures() {
  return useQuery({ queryKey: KEYS.mine(), queryFn: api.listMyProcedures });
}

export function useCommunityProcedures(communityId, filter = {}) {
  return useQuery({
    queryKey: communityId ? KEYS.community(communityId, filter) : KEYS.all,
    queryFn: () => api.listCommunityProcedures(communityId, filter),
    enabled: !!communityId,
  });
}

export function useProcedure(id) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : KEYS.all,
    queryFn: () => api.getProcedure(id),
    enabled: !!id,
  });
}

export function useCreateProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createProcedure,
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateProcedure(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.updateProcedure(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useAddProcedureUpdate(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.addProcedureUpdate(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}
