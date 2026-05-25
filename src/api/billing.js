import { api } from './client';

export const getBillingStatus = () =>
  api.get('/billing/status').then((r) => r.data);

export const createCheckoutSession = () =>
  api.post('/billing/checkout').then((r) => r.data);

export const createPortalSession = () =>
  api.post('/billing/portal').then((r) => r.data);

export async function createInvoiceCheckout(communityId, invoiceId) {
  const { data } = await api.post(`/billing/communities/${communityId}/invoices/${invoiceId}/checkout`);
  return data.url;
}
