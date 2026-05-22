import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export function useAdminKpis() {
  return useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: () => api.get('/admin/kpis').then(r => r.data),
  });
}
