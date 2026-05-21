import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/procedures';

const KEYS = {
  all: ['procedures'] as const,
  mine: () => ['procedures', 'mine'] as const,
  detail: (id: string) => ['procedures', 'detail', id] as const,
  community: (id: string, filter: api.ProcedureFilter) => ['procedures', 'community', id, filter] as const,
};

export function useMyProcedures() {
  return useQuery({ queryKey: KEYS.mine(), queryFn: api.listMyProcedures });
}

export function useCommunityProcedures(communityId: string | undefined, filter: api.ProcedureFilter = {}) {
  return useQuery({
    queryKey: communityId ? KEYS.community(communityId, filter) : KEYS.all,
    queryFn: () => api.listCommunityProcedures(communityId!, filter),
    enabled: !!communityId,
  });
}

export function useProcedure(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : KEYS.all,
    queryFn: () => api.getProcedure(id!),
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

export function useUpdateProcedure(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof api.updateProcedure>[1]) => api.updateProcedure(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useAddProcedureUpdate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.addProcedureUpdate(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}
