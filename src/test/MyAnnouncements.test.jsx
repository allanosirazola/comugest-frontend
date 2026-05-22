import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { MyAnnouncementsPage } from '@/pages/MyAnnouncements';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatDate: (d) => d,
}));

vi.mock('@/hooks/useComms', () => ({
  useMyAnnouncements: vi.fn(),
}));

import { useMyAnnouncements } from '@/hooks/useComms';

function renderPage() {
  return render(<MemoryRouter><MyAnnouncementsPage /></MemoryRouter>);
}

describe('MyAnnouncementsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    useMyAnnouncements.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty state when no announcements', () => {
    useMyAnnouncements.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/no hay anuncios todavía/i)).toBeInTheDocument();
  });

  it('renders announcements', () => {
    useMyAnnouncements.mockReturnValue({
      data: [{
        id: '1',
        title: 'Reunión de propietarios',
        body: 'Se convoca reunión para el día 20.',
        pinned: false,
        publishedAt: '2024-04-10',
        community: { name: 'Comunidad Norte' },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('Reunión de propietarios')).toBeInTheDocument();
    expect(screen.getByText('Se convoca reunión para el día 20.')).toBeInTheDocument();
  });

  it('shows pin icon for pinned announcements', () => {
    useMyAnnouncements.mockReturnValue({
      data: [{
        id: '2',
        title: 'Aviso urgente',
        body: 'Corte de agua mañana.',
        pinned: true,
        publishedAt: '2024-04-11',
        community: { name: 'Com' },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('📌')).toBeInTheDocument();
  });
});
