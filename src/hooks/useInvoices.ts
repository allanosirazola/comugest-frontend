import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/invoices';

const KEYS = {
  all: ['invoices'] as const,
  list: (communityId: string, filter: api.InvoiceFilter) =>
    [...KEYS.all, 'list', communityId, filter] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
  overdue: (communityId: string) => [...KEYS.all, 'overdue', communityId] as const,
  mine: () => [...KEYS.all, 'mine'] as const,
};

export function useCommunityInvoices(communityId: string | undefined, filter: api.InvoiceFilter = {}) {
  return useQuery({
    queryKey: communityId ? KEYS.list(communityId, filter) : KEYS.all,
    queryFn: () => api.listCommunityInvoices(communityId!, filter),
    enabled: !!communityId,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : KEYS.all,
    queryFn: () => api.getInvoice(id!),
    enabled: !!id,
  });
}

export function useOverdue(communityId: string | undefined) {
  return useQuery({
    queryKey: communityId ? KEYS.overdue(communityId) : KEYS.all,
    queryFn: () => api.listOverdue(communityId!),
    enabled: !!communityId,
  });
}

export function useMyInvoiceItems() {
  return useQuery({
    queryKey: KEYS.mine(),
    queryFn: api.listMyInvoiceItems,
  });
}

export function useCreateInvoice(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: api.CreateInvoiceInput) => api.createInvoice(communityId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useRecordPayment(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: Parameters<typeof api.recordPayment>[1] }) =>
      api.recordPayment(itemId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(invoiceId) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useDeletePayment(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deletePayment,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(invoiceId) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useCancelInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.cancelInvoice,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
