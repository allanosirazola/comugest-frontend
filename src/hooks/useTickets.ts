import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/tickets';

const KEYS = {
  all: ['tickets'] as const,
  mine: () => ['tickets', 'mine'] as const,
  detail: (id: string) => ['tickets', 'detail', id] as const,
  support: (filter: api.TicketFilter) => ['tickets', 'support', filter] as const,
  metrics: () => ['support', 'metrics'] as const,
};

export function useMyTickets() {
  return useQuery({ queryKey: KEYS.mine(), queryFn: api.listMyTickets });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : KEYS.all,
    queryFn: () => api.getTicket(id!),
    enabled: !!id,
  });
}

export function useAllTickets(filter: api.TicketFilter = {}) {
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

export function useUpdateTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof api.updateTicket>[1]) => api.updateTicket(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useAddComment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, internal }: { body: string; internal?: boolean }) => api.addComment(id, body, internal),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}
