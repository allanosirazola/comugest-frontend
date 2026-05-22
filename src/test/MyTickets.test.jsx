import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { MyTicketsPage } from '@/pages/MyTickets';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatDate: (d) => d,
}));

vi.mock('@/components/TicketBadges', () => ({
  TicketStatusBadge: ({ status }) => <span>{status}</span>,
}));

vi.mock('@/hooks/useTickets', () => ({
  useMyTickets: vi.fn(),
}));

import { useMyTickets } from '@/hooks/useTickets';

function renderPage() {
  return render(<MemoryRouter><MyTicketsPage /></MemoryRouter>);
}

describe('MyTicketsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    useMyTickets.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty state and report link when no tickets', () => {
    useMyTickets.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/no has reportado ninguna incidencia/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /reportar/i }).length).toBeGreaterThan(0);
  });

  it('renders ticket list', () => {
    useMyTickets.mockReturnValue({
      data: [{
        id: '1',
        subject: 'La calefacción no funciona',
        status: 'OPEN',
        category: 'MAINTENANCE',
        priority: 'HIGH',
        createdAt: '2024-01-15',
        _count: { comments: 2 },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('La calefacción no funciona')).toBeInTheDocument();
  });

  it('shows + report button in header', () => {
    useMyTickets.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByRole('link', { name: /\+ reportar/i })).toBeInTheDocument();
  });
});
