import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { MorososPage } from '@/pages/Morosos';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatMoney: (v) => `${v} €`,
  formatDate: (d) => d,
}));

vi.mock('@/hooks/useInvoices', () => ({
  useOverdue: vi.fn(),
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

import { useOverdue } from '@/hooks/useInvoices';
import { useCommunity } from '@/hooks/useCommunities';

function renderPage(id = 'comm-1') {
  return render(
    <MemoryRouter initialEntries={[`/communities/${id}/morosos`]}>
      <Routes>
        <Route path="/communities/:id/morosos" element={<MorososPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MorososPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCommunity.mockReturnValue({ data: { name: 'Comunidad Test' } });
  });

  it('shows loading state', () => {
    useOverdue.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty state when no morosos', () => {
    useOverdue.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/no hay impagos/i)).toBeInTheDocument();
  });

  it('renders morosos list', () => {
    useOverdue.mockReturnValue({
      data: [{
        owner: { id: 'u1', firstName: 'Pedro', lastName: 'Martínez', email: 'pedro@test.com' },
        totalPending: 450,
        items: [{
          id: 'i1',
          amount: '450.00',
          payments: [],
          invoice: { id: 'inv1', concept: 'Cuota Enero', dueDate: '2024-01-31' },
          unit: { label: '2ºA' },
        }],
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText(/Pedro Martínez/)).toBeInTheDocument();
    expect(screen.getByText('pedro@test.com')).toBeInTheDocument();
    expect(screen.getByText('Cuota Enero')).toBeInTheDocument();
  });

  it('shows total pending banner', () => {
    useOverdue.mockReturnValue({
      data: [
        { owner: { id: 'u1', firstName: 'A', lastName: 'B', email: 'a@b.com' }, totalPending: 100, items: [] },
        { owner: { id: 'u2', firstName: 'C', lastName: 'D', email: 'c@d.com' }, totalPending: 200, items: [] },
      ],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText(/2 vecinos/i)).toBeInTheDocument();
  });
});
