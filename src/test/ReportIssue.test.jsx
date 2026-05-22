import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { ReportIssuePage } from '@/pages/ReportIssue';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useTickets', () => ({
  useCreateTicket: vi.fn(),
}));

import { useCreateTicket } from '@/hooks/useTickets';

function renderPage() {
  return render(<MemoryRouter><ReportIssuePage /></MemoryRouter>);
}

describe('ReportIssuePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders subject, description fields and submit button', () => {
    useCreateTicket.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    renderPage();
    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar incidencia/i })).toBeInTheDocument();
  });

  it('renders category select', () => {
    useCreateTicket.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    renderPage();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls mutateAsync on valid submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: '1' });
    useCreateTicket.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/asunto/i), 'Fuga de agua en 3ºB');
    await user.type(screen.getByLabelText(/descripción/i), 'Hay una fuga desde ayer.');
    await user.click(screen.getByRole('button', { name: /enviar incidencia/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Fuga de agua en 3ºB',
        description: 'Hay una fuga desde ayer.',
      }));
    });
  });

  it('shows loading state on submit', () => {
    useCreateTicket.mockReturnValue({ mutateAsync: vi.fn(), isPending: true });
    renderPage();
    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled();
  });

  it('shows server error when mutateAsync rejects', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Error del servidor' } } },
    });
    useCreateTicket.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/asunto/i), 'Test');
    await user.type(screen.getByLabelText(/descripción/i), 'Descripción del problema.');
    await user.click(screen.getByRole('button', { name: /enviar incidencia/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error del servidor');
    });
  });
});
