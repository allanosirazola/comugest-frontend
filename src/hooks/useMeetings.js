import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/meetings';

const KEYS = {
  all: ['meetings'],
  community: (communityId) => ['meetings', communityId],
  detail: (id) => ['meeting', id],
};

export function useCommunityMeetings(communityId) {
  return useQuery({
    queryKey: KEYS.community(communityId),
    queryFn: () => api.listMeetings(communityId),
    enabled: !!communityId,
  });
}

export function useMeeting(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => api.getMeeting(id),
    enabled: !!id,
  });
}

export function useCreateMeeting(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createMeeting(communityId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.community(communityId) }),
  });
}

export function useUpdateMeeting(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.updateMeeting(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUpdateAttendance(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.updateAttendance(meetingId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.detail(meetingId) }),
  });
}

export function useSaveMinutes(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (minutes) => api.saveMinutes(meetingId, minutes),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.detail(meetingId) }),
  });
}

export function usePublishMinutes(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (published) => api.publishMinutes(meetingId, published),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.detail(meetingId) }),
  });
}

export function useGenerateQr(meetingId) {
  return useMutation({ mutationFn: () => api.generateQrToken(meetingId) });
}
