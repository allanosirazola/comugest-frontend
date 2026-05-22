import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/communities';

// ─── Communities ────────────────────────────────────────────

const KEYS = {
  all: ['communities'],
  list: () => [...KEYS.all, 'list'],
  detail: (id) => [...KEYS.all, 'detail', id],
  units: (id) => [...KEYS.all, id, 'units'],
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

export function useCommunity(id) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : KEYS.all,
    queryFn: () => api.getCommunity(id),
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

export function useUpdateCommunity(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.updateCommunity(id, input),
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

export function useUnits(communityId) {
  return useQuery({
    queryKey: communityId ? KEYS.units(communityId) : KEYS.all,
    queryFn: () => api.listUnits(communityId),
    enabled: !!communityId,
  });
}

export function useCreateUnit(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createUnit(communityId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.units(communityId) });
      void qc.invalidateQueries({ queryKey: KEYS.detail(communityId) });
    },
  });
}

export function useUpdateUnit(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, input }) => api.updateUnit(unitId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.units(communityId) });
      void qc.invalidateQueries({ queryKey: KEYS.detail(communityId) });
    },
  });
}

export function useDeleteUnit(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUnit,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.units(communityId) });
      void qc.invalidateQueries({ queryKey: KEYS.detail(communityId) });
    },
  });
}
