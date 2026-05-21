import { api } from './client';
import type {
  InvoiceSummary,
  InvoiceDetail,
  MyInvoiceItem,
  OverdueByOwner,
  Payment,
  PaymentMethod,
} from '@/types';

export interface CreateDerramaInput {
  type: 'DERRAMA';
  concept: string;
  description?: string | null;
  totalAmount: number;
  dueDate: string; // ISO
  issueDate?: string;
  attachmentUrl?: string | null;
  unitIds?: string[];
}

export interface CreateIndividualInput {
  type: 'INDIVIDUAL';
  concept: string;
  description?: string | null;
  dueDate: string;
  issueDate?: string;
  attachmentUrl?: string | null;
  items: Array<{
    unitId: string;
    amount: number;
    consumptionValue?: number | null;
    consumptionUnit?: string | null;
    notes?: string | null;
  }>;
}

export type CreateInvoiceInput = CreateDerramaInput | CreateIndividualInput;

export interface InvoiceFilter {
  status?: 'ALL' | 'PAID' | 'UNPAID' | 'OVERDUE';
  type?: 'DERRAMA' | 'INDIVIDUAL';
}

export async function listCommunityInvoices(communityId: string, filter: InvoiceFilter = {}): Promise<InvoiceSummary[]> {
  const { data } = await api.get<{ invoices: InvoiceSummary[] }>(`/communities/${communityId}/invoices`, {
    params: filter,
  });
  return data.invoices;
}

export async function createInvoice(communityId: string, input: CreateInvoiceInput): Promise<InvoiceSummary> {
  const { data } = await api.post<{ invoice: InvoiceSummary }>(`/communities/${communityId}/invoices`, input);
  return data.invoice;
}

export async function getInvoice(id: string): Promise<InvoiceDetail> {
  const { data } = await api.get<{ invoice: InvoiceDetail }>(`/invoices/${id}`);
  return data.invoice;
}

export async function cancelInvoice(id: string): Promise<void> {
  await api.delete(`/invoices/${id}`);
}

export async function recordPayment(
  itemId: string,
  input: { amount: number; paidAt?: string; method?: PaymentMethod; reference?: string | null; notes?: string | null }
): Promise<Payment> {
  const { data } = await api.post<{ payment: Payment }>(`/invoices/items/${itemId}/payments`, input);
  return data.payment;
}

export async function deletePayment(paymentId: string): Promise<void> {
  await api.delete(`/invoices/payments/${paymentId}`);
}

export async function listOverdue(communityId: string): Promise<OverdueByOwner[]> {
  const { data } = await api.get<{ overdueByOwner: OverdueByOwner[] }>(`/communities/${communityId}/invoices/overdue`);
  return data.overdueByOwner;
}

export async function listMyInvoiceItems(): Promise<MyInvoiceItem[]> {
  const { data } = await api.get<{ items: MyInvoiceItem[] }>(`/me/invoice-items`);
  return data.items;
}
