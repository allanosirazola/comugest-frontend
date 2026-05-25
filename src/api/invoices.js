import { api } from './client';

export async function listCommunityInvoices(communityId, filter = {}) {
  const { data } = await api.get(`/communities/${communityId}/invoices`, { params: filter });
  return data.invoices;
}

export async function createInvoice(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/invoices`, input);
  return data.invoice;
}

export async function getInvoice(id) {
  const { data } = await api.get(`/invoices/${id}`);
  return data.invoice;
}

export async function cancelInvoice(id) {
  await api.delete(`/invoices/${id}`);
}

export async function recordPayment(itemId, input) {
  const { data } = await api.post(`/invoices/items/${itemId}/payments`, input);
  return data.payment;
}

export async function deletePayment(paymentId) {
  await api.delete(`/invoices/payments/${paymentId}`);
}

export async function listOverdue(communityId) {
  const { data } = await api.get(`/communities/${communityId}/invoices/overdue`);
  return data.overdueByOwner;
}

export async function listMyInvoiceItems() {
  const { data } = await api.get('/me/invoice-items');
  return data.items;
}

export async function exportSepa(invoiceId, body) {
  const { data } = await api.post(`/invoices/${invoiceId}/sepa`, body, {
    responseType: 'text',
  });
  return data;
}

export async function exportPdf(invoiceId) {
  const { data } = await api.get(`/invoices/${invoiceId}/pdf`, {
    responseType: 'arraybuffer',
  });
  return data;
}

export async function createBulkInvoice(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/invoices/bulk`, input);
  return data.invoice;
}
