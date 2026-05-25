import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBillingStatus } from '@/hooks/useBilling';

const BILLING_EXEMPT_PATHS = ['/billing', '/billing/success', '/profile'];

function isBillingExempt(pathname) {
  return BILLING_EXEMPT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function AdminFincasPaywallCheck({ children }) {
  const location = useLocation();
  const { data: billing, isLoading } = useBillingStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <div className="text-olive-600">Cargando…</div>
      </div>
    );
  }

  const planStatus = billing?.planStatus ?? 'FREE';

  if (planStatus !== 'ACTIVE' && !isBillingExempt(location.pathname)) {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
}

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <div className="text-olive-600">Cargando…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (user?.role === 'ADMIN_FINCAS' && !isBillingExempt(location.pathname)) {
    return <AdminFincasPaywallCheck>{children}</AdminFincasPaywallCheck>;
  }

  return <>{children}</>;
}
