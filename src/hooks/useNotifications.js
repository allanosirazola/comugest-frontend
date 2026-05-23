import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/notifications';

const KEY = ['notifications'];

export function useNotifications() {
  return useQuery({
    queryKey: KEY,
    queryFn: api.listNotifications,
    refetchInterval: 60_000, // poll every minute
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.markNotificationRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markAllRead,
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}
