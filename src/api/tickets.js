import { api } from './client';

export const TICKET_CATEGORIES = ['BUG', 'FEATURE_REQUEST', 'QUESTION', 'BILLING', 'OTHER'];
export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export async function createTicket(input) {
  // Adjuntamos contexto técnico para facilitar el diagnóstico
  const payload = {
    ...input,
    pageUrl: input.pageUrl ?? window.location.href,
    userAgent: navigator.userAgent,
  };
  const { data } = await api.post('/tickets', payload);
  return data.ticket;
}

export async function listMyTickets() {
  const { data } = await api.get('/me/tickets');
  return data.tickets;
}

export async function getTicket(id) {
  const { data } = await api.get(`/tickets/${id}`);
  return data.ticket;
}

export async function addComment(id, body, internal = false) {
  const { data } = await api.post(`/tickets/${id}/comments`, { body, internal });
  return data.comment;
}

// ─── SUPPORT ────────────────────────────────────────────────

export async function listAllTickets(filter = {}) {
  const { data } = await api.get('/support/tickets', { params: filter });
  return data.tickets;
}

export async function updateTicket(id, input) {
  const { data } = await api.patch(`/tickets/${id}`, input);
  return data.ticket;
}

export async function getMetrics() {
  const { data } = await api.get('/support/metrics');
  return data;
}
