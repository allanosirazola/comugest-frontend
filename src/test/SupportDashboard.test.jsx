import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { SupportDashboardPage } from '@/pages/SupportDashboard';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatDate: (d) => d,
}));

vi.mock('@/components/TicketBadges', () => ({
  TicketStatusBadge: ({ status }) => <span>{status}</span>,
  TicketPriorityBadge: ({ priority }) => <span>{priority}</span>,
}));

vi.mock('@/hooks/useTickets', () => ({
  useMetrics: vi.fn(),
  useAllTickets: vi.fn(),
}));

import { useMetrics, useAllTickets } from '@/hooks/useTickets';

const METRICS = {
  tickets: { open: 7, inProgress: 1, closed: 10 },
  platform: { communities: 5, units: 40 },
  users: { total: 25, admins: 3, residents: 20, newLast30Days: 8 },
};

function renderPage() {
  return render(<MemoryRouter><SupportDashboardPage /></MemoryRouter>);
}

describe('SupportDashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders metrics when available', () => {
    useMetrics.mockReturnValue({ data: METRICS });
    useAllTickets.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows loading state for tickets', () => {
    useMetrics.mockReturnValue({ data: undefined });
    useAllTickets.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty queue message when no tickets', () => {
    useMetrics.mockReturnValue({ data: METRICS });
    useAllTickets.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/no hay tickets/i)).toBeInTheDocument();
  });

  it('renders ticket rows', () => {
    useMetrics.mockReturnValue({ data: METRICS });
    useAllTickets.mockReturnValue({
      data: [{
        id: '1',
        subject: 'Problema de acceso',
        status: 'OPEN',
        priority: 'HIGH',
        category: 'BUG',
        createdAt: '2024-05-01',
        reporter: { firstName: 'Juan', lastName: 'García' },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('Problema de acceso')).toBeInTheDocument();
    expect(screen.getByText('Juan García')).toBeInTheDocument();
  });

  it('renders status filter buttons', () => {
    useMetrics.mockReturnValue({ data: undefined });
    useAllTickets.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument();
  });
});
