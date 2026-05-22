import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { MessagesPage } from '@/pages/Messages';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useMyCommunities: vi.fn(),
}));

vi.mock('@/hooks/useComms', () => ({
  useConversations: vi.fn(),
  useMessages: vi.fn(),
  useSendMessage: vi.fn(),
  useStartConversation: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { useMyCommunities } from '@/hooks/useCommunities';
import { useConversations, useMessages, useSendMessage, useStartConversation } from '@/hooks/useComms';

function renderPage() {
  return render(<MemoryRouter><MessagesPage /></MemoryRouter>);
}

describe('MessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    useMyCommunities.mockReturnValue({ data: [] });
    useMessages.mockReturnValue({ data: undefined, isLoading: true });
    useSendMessage.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useStartConversation.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it('shows loading state for conversations', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useConversations.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty vecino message when no conversations', () => {
    useAuth.mockReturnValue({ user: { role: 'VECINO' } });
    useConversations.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/no tienes conversaciones/i)).toBeInTheDocument();
  });

  it('shows admin empty message when no conversations as admin', () => {
    useAuth.mockReturnValue({ user: { role: 'ADMIN_FINCAS' } });
    useConversations.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/no hay conversaciones/i)).toBeInTheDocument();
  });

  it('renders conversation list as admin', () => {
    useAuth.mockReturnValue({ user: { role: 'ADMIN_FINCAS' } });
    useConversations.mockReturnValue({
      data: [{
        id: 'conv-1',
        communityId: 'c1',
        unreadCount: 2,
        lastMessage: { body: 'Hola' },
        resident: { firstName: 'María', lastName: 'López', email: 'maria@test.com' },
        community: { name: 'Comunidad Test' },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getAllByText('María López').length).toBeGreaterThan(0);
  });

  it('shows select-conversation prompt when no conversation selected as admin', () => {
    useAuth.mockReturnValue({ user: { role: 'SUPPORT' } });
    useConversations.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/selecciona una conversación/i)).toBeInTheDocument();
  });
});
