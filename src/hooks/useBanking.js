import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/banking';

export function useBankAccounts(communityId) {
  return useQuery({
    queryKey: ['banking', communityId],
    queryFn: () => api.listBankAccounts(communityId),
    enabled: !!communityId,
  });
}

export function useAddBankAccount(communityId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.addBankAccount(communityId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['banking', communityId] }),
  });
}

export function useTransactions(communityId, bankAccountId) {
  return useQuery({
    queryKey: ['banking', communityId, bankAccountId, 'transactions'],
    queryFn: () => api.listTransactions(communityId, bankAccountId),
    enabled: !!(communityId && bankAccountId),
  });
}
