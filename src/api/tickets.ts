import { api } from './client';
import type { Ticket, TicketComment, TicketCategory, TicketStatus, TicketPriority, SupportMetrics } from '@/types';

export const TICKET_CATEGORIES: TicketCategory[] = ['BUG', 'FEATURE_REQUEST', 'QUESTION', 'BILLING', 'OTHER'];
export const TICKET_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const TICKET_PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export interface CreateTicketInput {
  category: TicketCategory;
  subject: string;
  description: string;
  pageUrl?: string | null;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  // Adjuntamos contexto técnico para facilitar el diagnóstico
  const payload = {
    ...input,
    pageUrl: input.pageUrl ?? window.location.href,
    userAgent: navigator.userAgent,
  };
  const { data } = await api.post<{ ticket: Ticket }>('/tickets', payload);
  return data.ticket;
}

export async function listMyTickets(): Promise<Ticket[]> {
  const { data } = await api.get<{ tickets: Ticket[] }>('/me/tickets');
  return data.tickets;
}

export async function getTicket(id: string): Promise<Ticket> {
  const { data } = await api.get<{ ticket: Ticket }>(`/tickets/${id}`);
  return data.ticket;
}

export async function addComment(id: string, body: string, internal = false): Promise<TicketComment> {
  const { data } = await api.post<{ comment: TicketComment }>(`/tickets/${id}/comments`, { body, internal });
  return data.comment;
}

// ─── SUPPORT ────────────────────────────────────────────────

export interface TicketFilter {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
}

export async function listAllTickets(filter: TicketFilter = {}): Promise<Ticket[]> {
  const { data } = await api.get<{ tickets: Ticket[] }>('/support/tickets', { params: filter });
  return data.tickets;
}

export async function updateTicket(
  id: string,
  input: { status?: TicketStatus; priority?: TicketPriority; assignedToId?: string | null }
): Promise<Ticket> {
  const { data } = await api.patch<{ ticket: Ticket }>(`/tickets/${id}`, input);
  return data.ticket;
}

export async function getMetrics(): Promise<SupportMetrics> {
  const { data } = await api.get<SupportMetrics>('/support/metrics');
  return data;
}
