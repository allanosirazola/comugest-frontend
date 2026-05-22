import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CommunityProceduresPage } from '@/pages/CommunityProcedures';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatDate: (d) => d,
}));

vi.mock('@/components/ProcedureStatusBadge', () => ({
  ProcedureStatusBadge: ({ status }) => <span>{status}</span>,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

vi.mock('@/hooks/useProcedures', () => ({
  useCommunityProcedures: vi.fn(),
}));

import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityProcedures } from '@/hooks/useProcedures';

function renderPage(id = 'comm-1') {
  return render(
    <MemoryRouter initialEntries={[`/communities/${id}/procedures`]}>
      <Routes>
        <Route path="/communities/:id/procedures" element={<CommunityProceduresPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CommunityProceduresPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCommunity.mockReturnValue({ data: { name: 'Com Test' } });
  });

  it('shows loading state', () => {
    useCommunityProcedures.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty queue message', () => {
    useCommunityProcedures.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/no hay trámites/i)).toBeInTheDocument();
  });

  it('renders procedure rows', () => {
    useCommunityProcedures.mockReturnValue({
      data: [{
        id: 'p1',
        subject: 'Cambio de titularidad',
        status: 'SUBMITTED',
        type: 'OWNERSHIP_CHANGE',
        createdAt: '2024-04-01',
        requester: { firstName: 'Laura', lastName: 'Gómez' },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('Cambio de titularidad')).toBeInTheDocument();
    expect(screen.getByText('Laura Gómez')).toBeInTheDocument();
  });

  it('renders status filter buttons', () => {
    useCommunityProcedures.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument();
  });
});
