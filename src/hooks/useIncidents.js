import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/incidents';
import { addIncidentPhoto, removeIncidentPhoto } from '@/api/incidents';

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

export function useAddIncidentPhoto(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, dataUri }) => addIncidentPhoto(communityId, incidentId, dataUri),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents', communityId] }),
  });
}

export function useRemoveIncidentPhoto(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, photoIndex }) => removeIncidentPhoto(communityId, incidentId, photoIndex),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents', communityId] }),
  });
}
