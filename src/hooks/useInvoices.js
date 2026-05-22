import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/invoices';

const KEYS = {
  all: ['invoices'],
  list: (communityId, filter) => ['invoices', 'list', communityId, filter],
  detail: (id) => ['invoices', 'detail', id],
  overdue: (communityId) => ['invoices', 'overdue', communityId],
  mine: () => ['invoices', 'mine'],
};

export function useCommunityInvoices(communityId, filter = {}) {
  return useQuery({
    queryKey: communityId ? KEYS.list(communityId, filter) : KEYS.all,
    queryFn: () => api.listCommunityInvoices(communityId, filter),
    enabled: !!communityId,
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : KEYS.all,
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
  });
}

export function useOverdue(communityId) {
  return useQuery({
    queryKey: communityId ? KEYS.overdue(communityId) : KEYS.all,
    queryFn: () => api.listOverdue(communityId),
    enabled: !!communityId,
  });
}

export function useMyInvoiceItems() {
  return useQuery({
    queryKey: KEYS.mine(),
    queryFn: api.listMyInvoiceItems,
  });
}

export function useCreateInvoice(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.createInvoice(communityId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useRecordPayment(invoiceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }) => api.recordPayment(itemId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(invoiceId) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useDeletePayment(invoiceId) {
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
