import { api } from './client';
import type { AuthResponse, InvitationInfo } from '@/types';

export interface CreateInvitationInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  communityId: string;
  unitId: string;
  relationType: 'OWNER' | 'OCCUPANT' | 'BOTH';
  locale?: 'es' | 'en';
}

export async function createInvitation(input: CreateInvitationInput): Promise<{
  invitationId: string;
  userId: string;
  sentTo: string;
}> {
  const { data } = await api.post('/invitations', input);
  return data;
}

export async function inspectInvitation(token: string): Promise<InvitationInfo> {
  const { data } = await api.get<InvitationInfo>('/invitations/inspect', { params: { token } });
  return data;
}

export async function acceptInvitation(input: {
  token: string;
  password: string;
  gdprAccepted: true;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/invitations/accept', input);
  return data;
}
