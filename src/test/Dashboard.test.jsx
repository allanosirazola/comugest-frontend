import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { DashboardPage } from '@/pages/Dashboard';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children,
}));

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunities: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useAdmin', () => ({
  useAdminKpis: vi.fn().mockReturnValue({ data: null, isLoading: false }),
}));

vi.mock('@/hooks/useInvoices', () => ({
  useCommunityInvoices: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useExpenses', () => ({
  useCommunityExpenses: vi.fn().mockReturnValue({ data: { expenses: [], summary: {} }, isLoading: false }),
}));

vi.mock('@/components/OnboardingWizard', () => ({
  OnboardingWizard: () => null,
}));

import { useAuth } from '@/contexts/AuthContext';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows admin cards when user is ADMIN_FINCAS', () => {
    useAuth.mockReturnValue({ user: { role: 'ADMIN_FINCAS', firstName: 'Ana' } });
    renderDashboard();
    expect(screen.getByText('Comunidades')).toBeInTheDocument();
  });

  it('shows admin cards when user is SUPPORT', () => {
    useAuth.mockReturnValue({ user: { role: 'SUPPORT', firstName: 'Sol' } });
    renderDashboard();
    expect(screen.getByText('Comunidades')).toBeInTheDocument();
  });

  it('shows vecino cards when user is VECINO', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO', firstName: 'Carlos' } });
    renderDashboard();
    expect(screen.getByRole('link', { name: /mis facturas/i })).toBeInTheDocument();
  });

  it('greets user by first name', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO', firstName: 'María' } });
    renderDashboard();
    expect(screen.getByText(/maría/i)).toBeInTheDocument();
  });
});
