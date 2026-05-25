import { useQuery } from '@tanstack/react-query';
import * as api from '@/api/calendar';

export function useCommunityCalendar(communityId, params) {
  return useQuery({
    queryKey: ['calendar', communityId, params],
    queryFn: () => api.getCommunityCalendar(communityId, params),
    enabled: !!communityId,
  });
}

export function useMyCalendar(params) {
  return useQuery({
    queryKey: ['my-calendar', params],
    queryFn: () => api.getMyCalendar(params),
  });
}
