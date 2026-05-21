import { api } from './client';
import type { Procedure, ProcedureUpdate, ProcedureType, ProcedureStatus } from '@/types';

export const PROCEDURE_TYPES: ProcedureType[] = [
  'CERTIFICATE',
  'MAINTENANCE',
  'DOCUMENT_REQUEST',
  'COMPLAINT',
  'PERMISSION',
  'OTHER',
];
export const PROCEDURE_STATUSES: ProcedureStatus[] = [
  'SUBMITTED',
  'IN_REVIEW',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
];

export interface CreateProcedureInput {
  communityId: string;
  type: ProcedureType;
  subject: string;
  description: string;
  unitId?: string | null;
}

export async function createProcedure(input: CreateProcedureInput): Promise<Procedure> {
  const { data } = await api.post<{ procedure: Procedure }>('/procedures', input);
  return data.procedure;
}

export async function listMyProcedures(): Promise<Procedure[]> {
  const { data } = await api.get<{ procedures: Procedure[] }>('/me/procedures');
  return data.procedures;
}

export interface ProcedureFilter {
  status?: ProcedureStatus;
  type?: ProcedureType;
}

export async function listCommunityProcedures(communityId: string, filter: ProcedureFilter = {}): Promise<Procedure[]> {
  const { data } = await api.get<{ procedures: Procedure[] }>(`/communities/${communityId}/procedures`, {
    params: filter,
  });
  return data.procedures;
}

export async function getProcedure(id: string): Promise<Procedure> {
  const { data } = await api.get<{ procedure: Procedure }>(`/procedures/${id}`);
  return data.procedure;
}

export async function updateProcedure(
  id: string,
  input: { status?: ProcedureStatus; resolution?: string | null; attachmentUrl?: string | null }
): Promise<Procedure> {
  const { data } = await api.patch<{ procedure: Procedure }>(`/procedures/${id}`, input);
  return data.procedure;
}

export async function addProcedureUpdate(id: string, body: string): Promise<ProcedureUpdate> {
  const { data } = await api.post<{ update: ProcedureUpdate }>(`/procedures/${id}/updates`, { body });
  return data.update;
}
