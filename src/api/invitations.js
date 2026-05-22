import { api } from './client';

export async function createInvitation(input) {
  const { data } = await api.post('/invitations', input);
  return data;
}

export async function inspectInvitation(token) {
  const { data } = await api.get('/invitations/inspect', { params: { token } });
  return data;
}

export async function acceptInvitation(input) {
  const { data } = await api.post('/invitations/accept', input);
  return data;
}
