import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { TicketDetailPage } from '@/pages/TicketDetail';

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

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children,
}));

vi.mock('@/hooks/useTickets', () => ({
  useTicket: vi.fn(),
  useUpdateTicket: vi.fn(),
  useAddComment: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { useTicket, useUpdateTicket, useAddComment } from '@/hooks/useTickets';

const MOCK_TICKET = {
  id: 't1',
  subject: 'El ascensor no funciona',
  category: 'BUG',
  description: 'Se ha averiado el motor',
  status: 'OPEN',
  priority: 'HIGH',
  createdAt: '2025-01-01T10:00:00Z',
  reporter: { firstName: 'Ana', lastName: 'García', email: 'ana@test.com' },
  comments: [
    {
      id: 'c1',
      body: 'Hemos recibido tu incidencia',
      internal: false,
      createdAt: '2025-01-02T10:00:00Z',
      author: { firstName: 'Soporte', lastName: '' },
    },
  ],
  pageUrl: null,
  userAgent: null,
};

function renderPage(id = 't1') {
  return render(
    <MemoryRouter initialEntries={[`/tickets/${id}`]}>
      <Routes>
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TicketDetailPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUpdateTicket.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useAddComment.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
  });

  // ─── Comment textarea ────────────────────────────────────────────────────────

  it('renders the comment textarea', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();
    expect(screen.getByPlaceholderText(/escribe una respuesta/i)).toBeInTheDocument();
  });

  it('user can type a comment in the textarea', async () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });

    const user = userEvent.setup();
    renderPage();

    const textarea = screen.getByPlaceholderText(/escribe una respuesta/i);
    await user.type(textarea, 'Mi comentario de prueba');
    expect(textarea).toHaveValue('Mi comentario de prueba');
  });

  // ─── Submit "Enviar" comment button ─────────────────────────────────────────

  it('submit button calls addComment.mutateAsync with {body, internal}', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useAddComment.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(/escribe una respuesta/i), 'Nuevo comentario');
    await user.click(screen.getByRole('button', { name: /^enviar$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ body: 'Nuevo comentario', internal: false });
    });
  });

  it('clears the textarea after a successful comment submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useAddComment.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    const textarea = screen.getByPlaceholderText(/escribe una respuesta/i);
    await user.type(textarea, 'Un comentario');
    await user.click(screen.getByRole('button', { name: /^enviar$/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  // ─── Submit button disabled when comment is empty ───────────────────────────

  it('submit button is disabled when the comment textarea is empty', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();

    expect(screen.getByRole('button', { name: /^enviar$/i })).toBeDisabled();
  });

  it('submit button becomes enabled after typing in the textarea', async () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });

    const user = userEvent.setup();
    renderPage();

    const submitBtn = screen.getByRole('button', { name: /^enviar$/i });
    expect(submitBtn).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/escribe una respuesta/i), 'Hola');
    expect(submitBtn).not.toBeDisabled();
  });

  it('submit button is disabled again when textarea is cleared', async () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });

    const user = userEvent.setup();
    renderPage();

    const textarea = screen.getByPlaceholderText(/escribe una respuesta/i);
    await user.type(textarea, 'Texto');
    expect(screen.getByRole('button', { name: /^enviar$/i })).not.toBeDisabled();

    await user.clear(textarea);
    expect(screen.getByRole('button', { name: /^enviar$/i })).toBeDisabled();
  });

  // ─── Internal note checkbox (SUPPORT / admin only) ──────────────────────────

  it('does not show internal note checkbox for non-support users', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();
    expect(screen.queryByLabelText(/nota interna/i)).not.toBeInTheDocument();
  });

  it('shows internal note checkbox for SUPPORT users', () => {
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();
    expect(screen.getByLabelText(/nota interna/i)).toBeInTheDocument();
  });

  it('internal note checkbox toggles the internal flag', async () => {
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });

    const user = userEvent.setup();
    renderPage();

    const checkbox = screen.getByLabelText(/nota interna/i);
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('submitting with internal checked sends internal: true', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useAddComment.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(/escribe una respuesta/i), 'Nota privada');
    await user.click(screen.getByLabelText(/nota interna/i));
    await user.click(screen.getByRole('button', { name: /^enviar$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ body: 'Nota privada', internal: true });
    });
  });

  it('internal flag resets to false after comment submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useAddComment.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(/escribe una respuesta/i), 'Nota');
    await user.click(screen.getByLabelText(/nota interna/i));
    expect(screen.getByLabelText(/nota interna/i)).toBeChecked();

    await user.click(screen.getByRole('button', { name: /^enviar$/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/nota interna/i)).not.toBeChecked();
    });
  });

  // ─── Status update select (SUPPORT only) ─────────────────────────────────────

  // Note: the status/priority <label> elements in TicketDetail have no htmlFor/id
  // association, so we find selects by role='combobox' (index 0=status, 1=priority).

  it('shows status and priority selects for SUPPORT users', () => {
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();

    expect(screen.getByText(/gestión/i)).toBeInTheDocument();
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2); // status + priority
  });

  it('status select shows ticket current status as selected', () => {
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();

    const [statusSelect] = screen.getAllByRole('combobox');
    expect(statusSelect).toHaveValue('OPEN');
  });

  it('changing status select calls updateTicket.mutate with new status', async () => {
    const mutate = vi.fn();
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useUpdateTicket.mockReturnValue({ mutate, isPending: false });

    const user = userEvent.setup();
    renderPage();

    const [statusSelect] = screen.getAllByRole('combobox');
    await user.selectOptions(statusSelect, 'IN_PROGRESS');

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({ status: 'IN_PROGRESS' });
    });
  });

  it('changing status to RESOLVED calls updateTicket.mutate', async () => {
    const mutate = vi.fn();
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useUpdateTicket.mockReturnValue({ mutate, isPending: false });

    const user = userEvent.setup();
    renderPage();

    const [statusSelect] = screen.getAllByRole('combobox');
    await user.selectOptions(statusSelect, 'RESOLVED');

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({ status: 'RESOLVED' });
    });
  });

  // ─── Priority update select (SUPPORT only) ───────────────────────────────────

  it('priority select shows ticket current priority as selected', () => {
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();

    const [, prioritySelect] = screen.getAllByRole('combobox');
    expect(prioritySelect).toHaveValue('HIGH');
  });

  it('changing priority select calls updateTicket.mutate with new priority', async () => {
    const mutate = vi.fn();
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useUpdateTicket.mockReturnValue({ mutate, isPending: false });

    const user = userEvent.setup();
    renderPage();

    const [, prioritySelect] = screen.getAllByRole('combobox');
    await user.selectOptions(prioritySelect, 'URGENT');

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({ priority: 'URGENT' });
    });
  });

  it('changing priority to LOW calls updateTicket.mutate', async () => {
    const mutate = vi.fn();
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useUpdateTicket.mockReturnValue({ mutate, isPending: false });

    const user = userEvent.setup();
    renderPage();

    const [, prioritySelect] = screen.getAllByRole('combobox');
    await user.selectOptions(prioritySelect, 'LOW');

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({ priority: 'LOW' });
    });
  });

  // ─── Comment list rendered ────────────────────────────────────────────────────

  it('renders existing comments', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();
    expect(screen.getByText('Hemos recibido tu incidencia')).toBeInTheDocument();
    expect(screen.getByText(/soporte/i)).toBeInTheDocument();
  });

  // ─── Comment form not shown when ticket is CLOSED ────────────────────────────

  it('does not render comment form for CLOSED tickets', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: { ...MOCK_TICKET, status: 'CLOSED' }, isLoading: false });
    renderPage();
    expect(screen.queryByPlaceholderText(/escribe una respuesta/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^enviar$/i })).not.toBeInTheDocument();
  });

  // ─── addComment.isPending disables submit ────────────────────────────────────

  it('submit button is disabled while addComment is pending', async () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useAddComment.mockReturnValue({ mutateAsync: vi.fn(), isPending: true });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(/escribe una respuesta/i), 'Texto');
    expect(screen.getByRole('button', { name: /^enviar$/i })).toBeDisabled();
  });
});
