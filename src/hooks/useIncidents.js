import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/incidents';

const KEY = (communityId) => ['incidents', communityId];

export function useIncidents(communityId) {
  return useQuery({
    queryKey: KEY(communityId),
    queryFn: () => api.listIncidents(communityId),
    enabled: !!communityId,
  });
}

export function useCreateIncident(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createIncident(communityId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY(communityId) }),
  });
}

export function useUpdateIncidentStatus(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, ...input }) => api.updateIncidentStatus(communityId, incidentId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY(communityId) }),
  });
}
