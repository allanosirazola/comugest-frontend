import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function BillingSuccessPage() {
  const navigate = useNavigate();
  useEffect(() => {
    // Stripe already appended ?session_id= — pass it to the billing page
    const params = new URLSearchParams(window.location.search);
    navigate(`/billing?session_id=${params.get('session_id') ?? ''}`, { replace: true });
  }, [navigate]);
  return null;
}
