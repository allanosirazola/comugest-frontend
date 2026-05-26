import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CommunityMeetingsPage } from '@/pages/CommunityMeetings';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatDate: (d) => d,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

vi.mock('@/hooks/useMeetings', () => ({
  useCommunityMeetings: vi.fn(),
  useCreateMeeting: vi.fn(),
}));

vi.mock('@/api/meetings', () => ({
  downloadConvocatoria: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityMeetings, useCreateMeeting } from '@/hooks/useMeetings';
import { downloadConvocatoria } from '@/api/meetings';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communities/c1']}>
      <Routes>
        <Route path="/communities/:id" element={<CommunityMeetingsPage />} />
        <Route path="/communities/:id/meetings/:meetingId" element={<div>Meeting Detail</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const adminUser = { id: 'u1', role: 'ADMIN_FINCAS', firstName: 'Admin', lastName: 'Test' };
const residentUser = { id: 'u2', role: 'RESIDENT', firstName: 'Vecino', lastName: 'Test' };

describe('CommunityMeetingsPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({ user: adminUser });
    useCommunity.mockReturnValue({ data: { id: 'c1', name: 'Comunidad Test' } });
    useCommunityMeetings.mockReturnValue({ data: [], isLoading: false });
    useCreateMeeting.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
  });

  it('renders the page heading', () => {
    renderPage();
    // es: meetings.title → "Juntas de vecinos"
    expect(screen.getByRole('heading', { name: /juntas de vecinos/i })).toBeInTheDocument();
  });

  it('shows "Convocar junta" button only for admin users', () => {
    renderPage();
    // es: meetings.newMeeting → "Convocar junta"
    expect(screen.getByRole('button', { name: /convocar junta/i })).toBeInTheDocument();
  });

  it('does not show "Convocar junta" button for non-admin users', () => {
    useAuth.mockReturnValue({ user: residentUser });
    renderPage();
    expect(screen.queryByRole('button', { name: /convocar junta/i })).not.toBeInTheDocument();
  });

  it('"Convocar junta" button toggles the create form on/off', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /convocar junta/i }));

    // es: meetings.meetingTitle → "Asunto"
    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();

    // Clicking again toggles off (button becomes "Cancelar")
    // es: common.cancel → "Cancelar"
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByLabelText(/asunto/i)).not.toBeInTheDocument();
  });

  it('fills all form fields and submits, calling createMeeting.mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreateMeeting.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /convocar junta/i }));

    // es: meetings.meetingTitle → "Asunto" (id="meet-title")
    await user.type(document.getElementById('meet-title'), 'Junta anual ordinaria');

    // es: meetings.type → "Tipo" (id="meet-type")
    await user.selectOptions(document.getElementById('meet-type'), 'EXTRAORDINARY');

    // es: meetings.scheduledAt → "Fecha y hora" (id="meet-date")
    await user.type(document.getElementById('meet-date'), '2026-09-15T18:00');

    // es: meetings.location → "Lugar" (id="meet-location")
    await user.type(document.getElementById('meet-location'), 'Salón comunal planta baja');

    // es: meetings.agenda → "Orden del día" (id="meet-agenda")
    await user.type(document.getElementById('meet-agenda'), '1. Aprobación cuentas\n2. Ruegos y preguntas');

    // es: meetings.create → "Convocar"
    await user.click(screen.getByRole('button', { name: /^convocar$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Junta anual ordinaria',
          type: 'EXTRAORDINARY',
          location: 'Salón comunal planta baja',
        })
      );
    });
  });

  it('shows error alert when createMeeting.mutateAsync rejects', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Fecha no válida' } } },
    });
    useCreateMeeting.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /convocar junta/i }));
    await user.type(document.getElementById('meet-title'), 'Junta de prueba');
    await user.type(document.getElementById('meet-date'), '2026-09-15T18:00');
    await user.click(screen.getByRole('button', { name: /^convocar$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Fecha no válida');
    });
  });

  it('cancel button hides the creation form', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /convocar junta/i }));
    expect(screen.getByLabelText(/asunto/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByLabelText(/asunto/i)).not.toBeInTheDocument();
  });

  it('renders meeting list with status badges', () => {
    useCommunityMeetings.mockReturnValue({
      data: [
        {
          id: 'm1',
          title: 'Junta ordinaria mayo',
          type: 'ORDINARY',
          status: 'SCHEDULED',
          scheduledAt: '2026-05-20T18:00:00Z',
          location: 'Salón comunal',
          _count: { attendees: 12 },
        },
        {
          id: 'm2',
          title: 'Junta extraordinaria',
          type: 'EXTRAORDINARY',
          status: 'HELD',
          scheduledAt: '2026-04-10T17:00:00Z',
          location: null,
          _count: { attendees: 8 },
        },
      ],
      isLoading: false,
    });

    renderPage();

    expect(screen.getByText('Junta ordinaria mayo')).toBeInTheDocument();
    expect(screen.getByText('Junta extraordinaria')).toBeInTheDocument();

    // es: meetings.statusSCHEDULED → "Convocada"
    expect(screen.getByText(/convocada/i)).toBeInTheDocument();
    // es: meetings.statusHELD → "Celebrada"
    expect(screen.getByText(/celebrada/i)).toBeInTheDocument();

    // es: meetings.typeORDINARY → "Ordinaria"
    // Use getAllByText since "Extraordinaria" also contains "ordinaria"
    const ordinaryBadges = screen.getAllByText(/ordinaria/i);
    expect(ordinaryBadges.length).toBeGreaterThanOrEqual(1);
    // es: meetings.typeEXTRAORDINARY → "Extraordinaria"
    expect(screen.getByText('Extraordinaria')).toBeInTheDocument();
  });

  it('meeting list rows are clickable and navigate to meeting detail', async () => {
    useCommunityMeetings.mockReturnValue({
      data: [
        {
          id: 'm1',
          title: 'Junta test',
          type: 'ORDINARY',
          status: 'SCHEDULED',
          scheduledAt: '2026-05-20T18:00:00Z',
          location: null,
          _count: { attendees: 5 },
        },
      ],
      isLoading: false,
    });

    const user = userEvent.setup();
    renderPage();

    const meetingCard = screen.getByRole('button', { name: /junta test/i });
    await user.click(meetingCard);

    await waitFor(() => {
      expect(screen.getByText('Meeting Detail')).toBeInTheDocument();
    });
  });

  it('download convocatoria button calls downloadConvocatoria', async () => {
    useCommunityMeetings.mockReturnValue({
      data: [
        {
          id: 'm1',
          title: 'Junta test',
          type: 'ORDINARY',
          status: 'SCHEDULED',
          scheduledAt: '2026-05-20T18:00:00Z',
          location: null,
          _count: { attendees: 3 },
        },
      ],
      isLoading: false,
    });

    const user = userEvent.setup();
    renderPage();

    // The article card has role="button" and its accessible name includes all child text,
    // so we use getAllByRole and pick the <button> element (not the article).
    // es: meetings.downloadConvocatoria → "Descargar convocatoria"
    const downloadBtns = screen.getAllByRole('button', { name: /descargar convocatoria/i });
    // The actual <button> element is the one with tagName BUTTON
    const downloadBtn = downloadBtns.find((el) => el.tagName === 'BUTTON');
    await user.click(downloadBtn);

    expect(downloadConvocatoria).toHaveBeenCalledWith('m1');
  });
});
