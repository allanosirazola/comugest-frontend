import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { CreateProcedurePage } from '@/pages/CreateProcedure';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useMyCommunities: vi.fn(),
}));

vi.mock('@/hooks/useProcedures', () => ({
  useCreateProcedure: vi.fn(),
}));

import { useMyCommunities } from '@/hooks/useCommunities';
import { useCreateProcedure } from '@/hooks/useProcedures';

function renderPage() {
  return render(<MemoryRouter><CreateProcedurePage /></MemoryRouter>);
}

describe('CreateProcedurePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows not-in-community message when no communities', () => {
    useMyCommunities.mockReturnValue({ data: [] });
    useCreateProcedure.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    renderPage();
    expect(screen.getByText(/no perteneces a ninguna comunidad/i)).toBeInTheDocument();
  });

  it('renders form when communities are available', () => {
    useMyCommunities.mockReturnValue({ data: [{ id: 'c1', name: 'Mi Comunidad' }] });
    useCreateProcedure.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    renderPage();
    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it('calls mutateAsync on valid submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 'p1' });
    useMyCommunities.mockReturnValue({ data: [{ id: 'c1', name: 'Mi Comunidad' }] });
    useCreateProcedure.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/asunto/i), 'Solicitud de certificado');
    await user.type(screen.getByLabelText(/descripción/i), 'Necesito el certificado de deuda cero.');
    await user.click(screen.getByRole('button', { name: /presentar trámite/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Solicitud de certificado',
      }));
    });
  });

  it('shows loading button while pending', () => {
    useMyCommunities.mockReturnValue({ data: [{ id: 'c1', name: 'Mi Comunidad' }] });
    useCreateProcedure.mockReturnValue({ mutateAsync: vi.fn(), isPending: true });
    renderPage();
    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled();
  });
});
