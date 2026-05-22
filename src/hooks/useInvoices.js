import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/invoices';
import { useCallback } from 'react';

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

export function useExportSepa() {
  return useMutation({ mutationFn: ({ invoiceId, body }) => api.exportSepa(invoiceId, body) });
}

export function useExportPdf() {
  return useMutation({ mutationFn: (invoiceId) => api.exportPdf(invoiceId) });
}

export function useDownloadSepa(invoiceId) {
  const mutation = useExportSepa();
  const download = useCallback(
    async (body) => {
      const xml = await mutation.mutateAsync({ invoiceId, body });
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sepa-${invoiceId}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [invoiceId, mutation]
  );
  return { download, isPending: mutation.isPending, error: mutation.error };
}

export function useDownloadPdf(invoiceId) {
  const mutation = useExportPdf();
  const download = useCallback(
    async () => {
      const buffer = await mutation.mutateAsync(invoiceId);
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [invoiceId, mutation]
  );
  return { download, isPending: mutation.isPending, error: mutation.error };
}
