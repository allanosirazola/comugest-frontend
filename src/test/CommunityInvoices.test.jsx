import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CommunityInvoicesPage } from '@/pages/CommunityInvoices';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }) => <span>{status}</span>,
  formatMoney: (v) => `${v} €`,
  formatDate: (d) => d,
}));

vi.mock('@/hooks/useInvoices', () => ({
  useCommunityInvoices: vi.fn(),
  useOverdue: vi.fn(),
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

import { useCommunityInvoices, useOverdue } from '@/hooks/useInvoices';
import { useCommunity } from '@/hooks/useCommunities';

function renderPage(id = 'comm-1') {
  return render(
    <MemoryRouter initialEntries={[`/communities/${id}/invoices`]}>
      <Routes>
        <Route path="/communities/:id/invoices" element={<CommunityInvoicesPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CommunityInvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCommunity.mockReturnValue({ data: { name: 'Comunidad Test' } });
    useOverdue.mockReturnValue({ data: [] });
  });

  it('shows loading state', () => {
    useCommunityInvoices.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty state when no invoices', () => {
    useCommunityInvoices.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/aún no hay facturas/i)).toBeInTheDocument();
  });

  it('renders invoice rows', () => {
    useCommunityInvoices.mockReturnValue({
      data: [{
        id: 'inv-1',
        concept: 'Cuota Enero',
        type: 'DERRAMA',
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        total: 1500,
        paidAmount: 750,
        status: 'PARTIALLY_PAID',
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('Cuota Enero')).toBeInTheDocument();
  });

  it('shows overdue alert banner when there are overdue items', () => {
    useCommunityInvoices.mockReturnValue({ data: [], isLoading: false });
    useOverdue.mockReturnValue({
      data: [{
        owner: { id: 'u1' },
        totalPending: 300,
        items: [{ id: 'i1' }, { id: 'i2' }],
      }],
    });
    renderPage();
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    useCommunityInvoices.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByRole('button', { name: /todas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pagadas/i })).toBeInTheDocument();
  });
});
