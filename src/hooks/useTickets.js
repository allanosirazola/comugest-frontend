import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/tickets';

const KEYS = {
  all: ['tickets'],
  mine: () => ['tickets', 'mine'],
  detail: (id) => ['tickets', 'detail', id],
  support: (filter) => ['tickets', 'support', filter],
  metrics: () => ['support', 'metrics'],
};

export function useMyTickets() {
  return useQuery({ queryKey: KEYS.mine(), queryFn: api.listMyTickets });
}

export function useTicket(id) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : KEYS.all,
    queryFn: () => api.getTicket(id),
    enabled: !!id,
  });
}

export function useAllTickets(filter = {}) {
  return useQuery({ queryKey: KEYS.support(filter), queryFn: () => api.listAllTickets(filter) });
}

export function useMetrics() {
  return useQuery({ queryKey: KEYS.metrics(), queryFn: api.getMetrics });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createTicket,
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateTicket(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.updateTicket(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useAddComment(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, internal }) => api.addComment(id, body, internal),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}
