import { api } from './client';
import type {
  CommunitySummary,
  CommunityDetail,
  Unit,
  UnitListItem,
  UnitType,
} from '@/types';

// ─── Communities ────────────────────────────────────────────

export interface CreateCommunityInput {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  cif?: string | null;
  units?: Array<{
    type: UnitType;
    label: string;
    floor?: string | null;
    door?: string | null;
    coefficient: number;
    surfaceM2?: number | null;
  }>;
}

export async function listCommunities(): Promise<CommunitySummary[]> {
  const { data } = await api.get<{ communities: CommunitySummary[] }>('/communities');
  return data.communities;
}

export async function listMyCommunities(): Promise<Array<{ id: string; name: string; city: string }>> {
  const { data } = await api.get<{ communities: Array<{ id: string; name: string; city: string }> }>('/me/communities');
  return data.communities;
}

export async function getCommunity(id: string): Promise<CommunityDetail> {
  const { data } = await api.get<{ community: CommunityDetail }>(`/communities/${id}`);
  return data.community;
}

export async function createCommunity(input: CreateCommunityInput): Promise<CommunitySummary> {
  const { data } = await api.post<{ community: CommunitySummary }>('/communities', input);
  return data.community;
}

export async function updateCommunity(
  id: string,
  input: Partial<Omit<CreateCommunityInput, 'units'>> & { redirectMessagesTo?: string | null }
): Promise<CommunitySummary> {
  const { data } = await api.patch<{ community: CommunitySummary }>(`/communities/${id}`, input);
  return data.community;
}

export async function deleteCommunity(id: string): Promise<void> {
  await api.delete(`/communities/${id}`);
}

// ─── Units ──────────────────────────────────────────────────

export interface CreateUnitInput {
  type: UnitType;
  label: string;
  floor?: string | null;
  door?: string | null;
  coefficient: number;
  surfaceM2?: number | null;
  customFields?: Record<string, unknown>;
}

export async function listUnits(communityId: string): Promise<UnitListItem[]> {
  const { data } = await api.get<{ units: UnitListItem[] }>(`/communities/${communityId}/units`);
  return data.units;
}

export async function createUnit(communityId: string, input: CreateUnitInput): Promise<Unit> {
  const { data } = await api.post<{ unit: Unit }>(`/communities/${communityId}/units`, input);
  return data.unit;
}

export async function updateUnit(unitId: string, input: Partial<CreateUnitInput>): Promise<Unit> {
  const { data } = await api.patch<{ unit: Unit }>(`/units/${unitId}`, input);
  return data.unit;
}

export async function deleteUnit(unitId: string): Promise<void> {
  await api.delete(`/units/${unitId}`);
}
