import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/waitlist';

const KEY = ['waitlist'];

export function useMyWaitlist() {
  return useQuery({ queryKey: KEY, queryFn: api.getMyWaitlist });
}

export function useJoinWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ areaId, startTime, endTime }) => api.joinWaitlist(areaId, startTime, endTime),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useLeaveWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId) => api.leaveWaitlist(entryId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}
