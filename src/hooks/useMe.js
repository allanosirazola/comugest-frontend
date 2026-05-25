import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/me';

const KEYS = {
  profile: () => ['me', 'profile'],
  reservations: () => ['me', 'reservations'],
  meetings: () => ['me', 'meetings'],
};

export function useProfile() {
  return useQuery({
    queryKey: KEYS.profile(),
    queryFn: api.getProfile,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.updateProfile(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.profile() });
      void qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input) => api.changePassword(input),
  });
}

export function useMyReservations() {
  return useQuery({
    queryKey: KEYS.reservations(),
    queryFn: api.listMyReservations,
  });
}

export function useMyMeetings() {
  return useQuery({
    queryKey: KEYS.meetings(),
    queryFn: api.listMyMeetings,
  });
}

export function useSetup2FA() {
  return useMutation({ mutationFn: api.setup2FA });
}

export function useVerify2FA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token) => api.verify2FA(token),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.profile() }),
  });
}

export function useDisable2FA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token) => api.disable2FA(token),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEYS.profile() }),
  });
}
