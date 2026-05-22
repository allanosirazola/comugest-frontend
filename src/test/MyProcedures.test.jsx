import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { MyProceduresPage } from '@/pages/MyProcedures';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatDate: (d) => d,
}));

vi.mock('@/components/ProcedureStatusBadge', () => ({
  ProcedureStatusBadge: ({ status }) => <span>{status}</span>,
}));

vi.mock('@/hooks/useProcedures', () => ({
  useMyProcedures: vi.fn(),
}));

import { useMyProcedures } from '@/hooks/useProcedures';

function renderPage() {
  return render(<MemoryRouter><MyProceduresPage /></MemoryRouter>);
}

describe('MyProceduresPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    useMyProcedures.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty state when no procedures', () => {
    useMyProcedures.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/no has presentado ningún trámite/i)).toBeInTheDocument();
  });

  it('renders procedure list', () => {
    useMyProcedures.mockReturnValue({
      data: [{
        id: '1',
        subject: 'Solicitud certificado',
        status: 'SUBMITTED',
        type: 'CERTIFICATE',
        createdAt: '2024-03-01',
        community: { name: 'Comunidad Olivos' },
        _count: { updates: 1 },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('Solicitud certificado')).toBeInTheDocument();
    expect(screen.getByText(/Comunidad Olivos/)).toBeInTheDocument();
  });

  it('has new procedure link', () => {
    useMyProcedures.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByRole('link', { name: /\+ nuevo trámite/i })).toBeInTheDocument();
  });
});
