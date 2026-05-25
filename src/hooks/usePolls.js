import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/polls';

export function usePolls(meetingId) {
  return useQuery({
    queryKey: ['polls', meetingId],
    queryFn: () => api.listPolls(meetingId),
    enabled: !!meetingId,
  });
}

export function useCreatePoll(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createPoll(meetingId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls', meetingId] }),
  });
}

export function useClosePoll(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pollId) => api.closePoll(meetingId, pollId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls', meetingId] }),
  });
}

export function useCastVote(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pollId, option }) => api.castVote(meetingId, pollId, option),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls', meetingId] }),
  });
}
