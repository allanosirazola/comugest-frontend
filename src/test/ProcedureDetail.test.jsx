import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { ProcedureDetailPage } from '@/pages/ProcedureDetail';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatDate: (d) => d,
}));

vi.mock('@/components/ProcedureStatusBadge', () => ({
  ProcedureStatusBadge: ({ status }) => <span>{status}</span>,
}));

vi.mock('@/api/procedures', () => ({
  PROCEDURE_STATUSES: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'],
}));

vi.mock('@/hooks/useProcedures', () => ({
  useProcedure: vi.fn(),
  useUpdateProcedure: vi.fn(),
  useAddProcedureUpdate: vi.fn(),
}));

import { useProcedure, useUpdateProcedure, useAddProcedureUpdate } from '@/hooks/useProcedures';

const MOCK_PROCEDURE = {
  id: 'p1',
  subject: 'Solicitud de certificado',
  description: 'Necesito un certificado de deuda.',
  status: 'OPEN',
  type: 'CERTIFICATE',
  createdAt: '2024-03-01',
  canManage: false,
  communityId: 'c1',
  requester: { firstName: 'Luis', lastName: 'Mora' },
  community: { name: 'Comunidad Test' },
  unit: null,
  resolution: null,
  attachmentUrl: null,
  updates: [],
};

function renderPage(id = 'p1') {
  return render(
    <MemoryRouter initialEntries={[`/procedures/${id}`]}>
      <Routes>
        <Route path="/procedures/:id" element={<ProcedureDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProcedureDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUpdateProcedure.mockReturnValue({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false });
    useAddProcedureUpdate.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it('shows loading state', () => {
    useProcedure.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renders procedure subject and description', () => {
    useProcedure.mockReturnValue({ data: MOCK_PROCEDURE, isLoading: false });
    renderPage();
    expect(screen.getByText('Solicitud de certificado')).toBeInTheDocument();
    expect(screen.getByText(/certificado de deuda/i)).toBeInTheDocument();
  });

  it('shows message form for non-completed procedure', () => {
    useProcedure.mockReturnValue({ data: MOCK_PROCEDURE, isLoading: false });
    renderPage();
    expect(screen.getByPlaceholderText(/escribe un mensaje/i)).toBeInTheDocument();
  });

  it('does not show message form for completed procedure', () => {
    useProcedure.mockReturnValue({ data: { ...MOCK_PROCEDURE, status: 'COMPLETED' }, isLoading: false });
    renderPage();
    expect(screen.queryByPlaceholderText(/escribe un mensaje/i)).not.toBeInTheDocument();
  });

  it('shows management panel when canManage is true', () => {
    useProcedure.mockReturnValue({ data: { ...MOCK_PROCEDURE, canManage: true }, isLoading: false });
    renderPage();
    expect(screen.getByText(/gestión/i)).toBeInTheDocument();
  });

  it('hides management panel when canManage is false', () => {
    useProcedure.mockReturnValue({ data: MOCK_PROCEDURE, isLoading: false });
    renderPage();
    expect(screen.queryByText(/gestión/i)).not.toBeInTheDocument();
  });

  it('calls addUpdate on message submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useProcedure.mockReturnValue({ data: MOCK_PROCEDURE, isLoading: false });
    useAddProcedureUpdate.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(/escribe un mensaje/i), 'Adjunto documentación');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('Adjunto documentación');
    });
  });

  it('renders updates from other users', () => {
    const procedureWithUpdate = {
      ...MOCK_PROCEDURE,
      updates: [{
        id: 'upd-1',
        body: 'Recibido, lo estamos gestionando.',
        createdAt: '2024-03-02',
        author: { firstName: 'Admin', lastName: 'Fincas', role: 'ADMIN_FINCAS' },
      }],
    };
    useProcedure.mockReturnValue({ data: procedureWithUpdate, isLoading: false });
    renderPage();
    expect(screen.getByText('Recibido, lo estamos gestionando.')).toBeInTheDocument();
  });
});
