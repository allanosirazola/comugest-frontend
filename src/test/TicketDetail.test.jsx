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
  subject: 'Fuga de agua',
  description: 'Hay una fuga en el baño del 2ºB.',
  status: 'OPEN',
  priority: 'HIGH',
  category: 'MAINTENANCE',
  createdAt: '2024-04-01',
  reporter: { firstName: 'Pedro', lastName: 'Sanz' },
  comments: [],
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

describe('TicketDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUpdateTicket.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useAddComment.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it('shows loading state', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renders ticket subject and description', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();
    expect(screen.getByText('Fuga de agua')).toBeInTheDocument();
    expect(screen.getByText(/fuga en el baño/i)).toBeInTheDocument();
  });

  it('shows comment form when ticket is not closed', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();
    expect(screen.getByPlaceholderText(/escribe una respuesta/i)).toBeInTheDocument();
  });

  it('does not show comment form when ticket is closed', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: { ...MOCK_TICKET, status: 'CLOSED' }, isLoading: false });
    renderPage();
    expect(screen.queryByPlaceholderText(/escribe una respuesta/i)).not.toBeInTheDocument();
  });

  it('shows management panel for support users', () => {
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();
    expect(screen.getByText(/gestión/i)).toBeInTheDocument();
  });

  it('hides management panel for regular users', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    renderPage();
    expect(screen.queryByText(/gestión/i)).not.toBeInTheDocument();
  });

  it('calls addComment on comment submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useTicket.mockReturnValue({ data: MOCK_TICKET, isLoading: false });
    useAddComment.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(/escribe una respuesta/i), 'Ya se ha resuelto');
    await user.click(screen.getByRole('button', { name: /^enviar$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ body: 'Ya se ha resuelto' }));
    });
  });
});
