import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/communities';

// ─── Communities ────────────────────────────────────────────

const KEYS = {
  all: ['communities'] as const,
  list: () => [...KEYS.all, 'list'] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
  units: (id: string) => [...KEYS.all, id, 'units'] as const,
};

export function useCommunities() {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: api.listCommunities,
  });
}

export function useMyCommunities() {
  return useQuery({
    queryKey: [...KEYS.all, 'mine'],
    queryFn: api.listMyCommunities,
  });
}

export function useCommunity(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : KEYS.all,
    queryFn: () => api.getCommunity(id!),
    enabled: !!id,
  });
}

export function useCreateCommunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCommunity,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.list() });
    },
  });
}

export function useUpdateCommunity(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof api.updateCommunity>[1]) => api.updateCommunity(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.list() });
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteCommunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCommunity,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.list() });
    },
  });
}

// ─── Units ──────────────────────────────────────────────────

export function useUnits(communityId: string | undefined) {
  return useQuery({
    queryKey: communityId ? KEYS.units(communityId) : KEYS.all,
    queryFn: () => api.listUnits(communityId!),
    enabled: !!communityId,
  });
}

export function useCreateUnit(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: api.CreateUnitInput) => api.createUnit(communityId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.units(communityId) });
      void qc.invalidateQueries({ queryKey: KEYS.detail(communityId) });
    },
  });
}

export function useUpdateUnit(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, input }: { unitId: string; input: Partial<api.CreateUnitInput> }) =>
      api.updateUnit(unitId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.units(communityId) });
      void qc.invalidateQueries({ queryKey: KEYS.detail(communityId) });
    },
  });
}

export function useDeleteUnit(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUnit,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.units(communityId) });
      void qc.invalidateQueries({ queryKey: KEYS.detail(communityId) });
    },
  });
}
