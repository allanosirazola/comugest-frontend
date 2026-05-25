import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children,
}));

vi.mock('@/hooks/useBilling', () => ({
  useBillingStatus: vi.fn().mockReturnValue({ data: { planStatus: 'ACTIVE' }, isLoading: false }),
}));

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function renderRoute({ isLoading, isAuthenticated, user, allowedRoles } = {}) {
  useAuth.mockReturnValue({ isLoading, isAuthenticated, user });

  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/" element={<div>home page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading indicator when isLoading is true', () => {
    renderRoute({ isLoading: true, isAuthenticated: false, user: null });
    // The component renders "Cargando…" (hard-coded Spanish string)
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('does not show protected content while loading', () => {
    renderRoute({ isLoading: true, isAuthenticated: false, user: null });
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderRoute({ isLoading: false, isAuthenticated: false, user: null });
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });

  it('renders children when authenticated with no role restriction', () => {
    renderRoute({
      isLoading: false,
      isAuthenticated: true,
      user: { role: 'VECINO' },
    });
    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  it('renders children when authenticated user has an allowed role', () => {
    renderRoute({
      isLoading: false,
      isAuthenticated: true,
      user: { role: 'ADMIN_FINCAS' },
      allowedRoles: ['ADMIN_FINCAS', 'SUPPORT'],
    });
    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  it('redirects to / when authenticated user has a disallowed role', () => {
    renderRoute({
      isLoading: false,
      isAuthenticated: true,
      user: { role: 'VECINO' },
      allowedRoles: ['ADMIN_FINCAS', 'SUPPORT'],
    });
    expect(screen.getByText(/home page/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });

  it('renders children when allowedRoles includes the SUPPORT role', () => {
    renderRoute({
      isLoading: false,
      isAuthenticated: true,
      user: { role: 'SUPPORT' },
      allowedRoles: ['ADMIN_FINCAS', 'SUPPORT'],
    });
    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });
});
