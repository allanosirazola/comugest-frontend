import { api } from './client';

export async function listBankAccounts(communityId) {
  const { data } = await api.get(`/communities/${communityId}/banking`);
  return data.accounts ?? [];
}

export async function addBankAccount(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/banking`, input);
  return data.account;
}

export async function listTransactions(communityId, bankAccountId) {
  const { data } = await api.get(`/communities/${communityId}/banking/${bankAccountId}/transactions`);
  return data.transactions ?? [];
}

export async function reconcileTransaction(communityId, bankAccountId, transactionId, invoiceItemId) {
  const { data } = await api.patch(
    `/communities/${communityId}/banking/${bankAccountId}/transactions/${transactionId}/reconcile`,
    { invoiceItemId }
  );
  return data.transaction;
}
