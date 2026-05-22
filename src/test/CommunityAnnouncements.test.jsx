import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CommunityAnnouncementsPage } from '@/pages/CommunityAnnouncements';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatDate: (d) => d,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

vi.mock('@/hooks/useComms', () => ({
  useCommunityAnnouncements: vi.fn(),
  useCreateAnnouncement: vi.fn(),
  useDeleteAnnouncement: vi.fn(),
}));

import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/hooks/useComms';

function renderPage(id = 'comm-1') {
  return render(
    <MemoryRouter initialEntries={[`/communities/${id}/announcements`]}>
      <Routes>
        <Route path="/communities/:id/announcements" element={<CommunityAnnouncementsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CommunityAnnouncementsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCommunity.mockReturnValue({ data: { name: 'Com Test' } });
    useCreateAnnouncement.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useDeleteAnnouncement.mockReturnValue({ mutateAsync: vi.fn() });
  });

  it('shows loading state', () => {
    useCommunityAnnouncements.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty state when no announcements', () => {
    useCommunityAnnouncements.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/aún no hay anuncios/i)).toBeInTheDocument();
  });

  it('renders announcements', () => {
    useCommunityAnnouncements.mockReturnValue({
      data: [{
        id: '1',
        title: 'Junta de propietarios',
        body: 'Se convoca junta el día 25.',
        pinned: false,
        publishedAt: '2024-04-01',
        author: { firstName: 'Admin', lastName: 'Fincas' },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('Junta de propietarios')).toBeInTheDocument();
    expect(screen.getByText('Se convoca junta el día 25.')).toBeInTheDocument();
  });

  it('opens form when create button is clicked', async () => {
    useCommunityAnnouncements.mockReturnValue({ data: [], isLoading: false });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }));

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contenido/i)).toBeInTheDocument();
  });

  it('calls mutateAsync on form submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreateAnnouncement.mockReturnValue({ mutateAsync, isPending: false });
    useCommunityAnnouncements.mockReturnValue({ data: [], isLoading: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }));
    await user.type(screen.getByLabelText(/título/i), 'Aviso importante');
    await user.type(screen.getByLabelText(/contenido/i), 'Texto del aviso.');
    await user.click(screen.getByRole('button', { name: /publicar/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ title: 'Aviso importante' }));
    });
  });
});
