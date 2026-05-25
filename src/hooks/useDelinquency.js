import { useQuery } from '@tanstack/react-query';
import { getUnitDelinquencyHistory, getOwnershipHistory } from '@/api/delinquency';

export function useUnitDelinquencyHistory(communityId, unitId) {
  return useQuery({
    queryKey: ['delinquency', communityId, unitId],
    queryFn: () => getUnitDelinquencyHistory(communityId, unitId),
    enabled: !!(communityId && unitId),
  });
}

export function useOwnershipHistory(communityId, unitId) {
  return useQuery({
    queryKey: ['ownership-history', communityId, unitId],
    queryFn: () => getOwnershipHistory(communityId, unitId),
    enabled: !!(communityId && unitId),
  });
}
