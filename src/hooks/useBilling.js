import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '@/api/billing';

export function useBillingStatus() {
  return useQuery({ queryKey: ['billing-status'], queryFn: api.getBillingStatus });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: api.createCheckoutSession,
    onSuccess: ({ url }) => { window.location.href = url; },
  });
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: api.createPortalSession,
    onSuccess: ({ url }) => { window.location.href = url; },
  });
}
