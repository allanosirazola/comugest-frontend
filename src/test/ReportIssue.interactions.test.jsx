import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { ReportIssuePage } from '@/pages/ReportIssue';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { role: 'VECINO', id: 'u1' } }),
  AuthProvider: ({ children }) => children,
}));

vi.mock('@/hooks/useTickets', () => ({
  useCreateTicket: vi.fn(),
}));

import { useCreateTicket } from '@/hooks/useTickets';

function renderPage() {
  return render(
    <MemoryRouter>
      <ReportIssuePage />
    </MemoryRouter>
  );
}

describe('ReportIssuePage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCreateTicket.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({ id: 'new-t1' }), isPending: false });
  });

  // ─── Category select ──────────────────────────────────────────────────────────

  it('renders the category select with BUG as default', () => {
    renderPage();
    const select = screen.getByLabelText(/categoría/i);
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('BUG');
  });

  it('category select contains all expected categories', () => {
    renderPage();
    const select = screen.getByLabelText(/categoría/i);
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('BUG');
    expect(options).toContain('FEATURE_REQUEST');
    expect(options).toContain('QUESTION');
    expect(options).toContain('BILLING');
    expect(options).toContain('OTHER');
  });

  it('user can select FEATURE_REQUEST category', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/categoría/i), 'FEATURE_REQUEST');
    expect(screen.getByLabelText(/categoría/i)).toHaveValue('FEATURE_REQUEST');
  });

  it('user can select QUESTION category', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/categoría/i), 'QUESTION');
    expect(screen.getByLabelText(/categoría/i)).toHaveValue('QUESTION');
  });

  it('user can select BILLING category', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/categoría/i), 'BILLING');
    expect(screen.getByLabelText(/categoría/i)).toHaveValue('BILLING');
  });

  it('user can select OTHER category', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/categoría/i), 'OTHER');
    expect(screen.getByLabelText(/categoría/i)).toHaveValue('OTHER');
  });

  // ─── Subject input ────────────────────────────────────────────────────────────

  it('renders the subject input', () => {
    renderPage();
    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();
  });

  it('user can type in the subject input', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/asunto/i), 'El botón no funciona');
    expect(screen.getByLabelText(/asunto/i)).toHaveValue('El botón no funciona');
  });

  // ─── Description textarea ─────────────────────────────────────────────────────

  it('renders the description textarea', () => {
    renderPage();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it('user can type in the description textarea', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/descripción/i), 'Al hacer clic en el botón de guardar aparece un error 500.');
    expect(screen.getByLabelText(/descripción/i)).toHaveValue('Al hacer clic en el botón de guardar aparece un error 500.');
  });

  // ─── Submit "Enviar incidencia" button ────────────────────────────────────────

  it('renders the submit button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /enviar incidencia/i })).toBeInTheDocument();
  });

  it('submit button calls createTicket.mutateAsync with category, subject and description', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 't-new' });
    useCreateTicket.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText(/categoría/i), 'BILLING');
    await user.type(screen.getByLabelText(/asunto/i), 'Cobro incorrecto');
    await user.type(screen.getByLabelText(/descripción/i), 'Me han cobrado dos veces.');
    await user.click(screen.getByRole('button', { name: /enviar incidencia/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'BILLING',
          subject: 'Cobro incorrecto',
          description: 'Me han cobrado dos veces.',
        })
      );
    });
  });

  it('submit button calls mutateAsync with default BUG category if not changed', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 't-new' });
    useCreateTicket.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/asunto/i), 'Login roto');
    await user.type(screen.getByLabelText(/descripción/i), 'No puedo entrar a la plataforma.');
    await user.click(screen.getByRole('button', { name: /enviar incidencia/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'BUG' })
      );
    });
  });

  it('submit trims whitespace from subject and description', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 't-new' });
    useCreateTicket.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/asunto/i), '  Asunto con espacios  ');
    await user.type(screen.getByLabelText(/descripción/i), '  Descripción con espacios  ');
    await user.click(screen.getByRole('button', { name: /enviar incidencia/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Asunto con espacios',
          description: 'Descripción con espacios',
        })
      );
    });
  });

  // ─── Shows server error on API failure ────────────────────────────────────────

  it('shows error alert when createTicket.mutateAsync rejects with server message', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Demasiadas solicitudes' } } },
    });
    useCreateTicket.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/asunto/i), 'Problema');
    await user.type(screen.getByLabelText(/descripción/i), 'Descripción del problema.');
    await user.click(screen.getByRole('button', { name: /enviar incidencia/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Demasiadas solicitudes');
    });
  });

  it('shows generic error message when rejection has no server message', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Network error'));
    useCreateTicket.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/asunto/i), 'Problema');
    await user.type(screen.getByLabelText(/descripción/i), 'Descripción del problema.');
    await user.click(screen.getByRole('button', { name: /enviar incidencia/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/algo ha salido mal/i);
    });
  });

  // ─── Loading state ────────────────────────────────────────────────────────────

  it('submit button shows loading text and is disabled when isPending', () => {
    useCreateTicket.mockReturnValue({ mutateAsync: vi.fn(), isPending: true });
    renderPage();

    const btn = screen.getByRole('button', { name: /cargando/i });
    expect(btn).toBeDisabled();
  });

  // ─── Validation: required fields ─────────────────────────────────────────────

  it('subject input has required attribute', () => {
    renderPage();
    expect(screen.getByLabelText(/asunto/i)).toBeRequired();
  });

  it('description textarea has required attribute', () => {
    renderPage();
    expect(screen.getByLabelText(/descripción/i)).toBeRequired();
  });

  // ─── Context note is shown ────────────────────────────────────────────────────

  it('displays context note about automatic URL and browser info', () => {
    renderPage();
    expect(screen.getByText(/url actual/i)).toBeInTheDocument();
  });

  // ─── "Mis incidencias" link ───────────────────────────────────────────────────

  it('renders a link to "Mis incidencias"', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /mis incidencias/i })).toBeInTheDocument();
  });
});
