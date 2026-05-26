import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { MeetingDetailPage } from '@/pages/MeetingDetail';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children,
}));

vi.mock('@/hooks/useMeetings', () => ({
  useMeeting: vi.fn(),
  useUpdateMeeting: vi.fn(),
  useUpdateAttendance: vi.fn(),
  useSaveMinutes: vi.fn(),
  usePublishMinutes: vi.fn(),
  useGenerateQr: vi.fn(),
  useSignMinutes: vi.fn(),
}));

vi.mock('@/hooks/usePolls', () => ({
  usePolls: vi.fn().mockReturnValue({ data: [] }),
  useCreatePoll: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  useClosePoll: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useCastVote: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/api/meetings', () => ({
  downloadConvocatoria: vi.fn().mockResolvedValue(undefined),
  downloadMinutesPdf: vi.fn().mockResolvedValue(undefined),
}));

import { useAuth } from '@/contexts/AuthContext';
import {
  useMeeting,
  useUpdateMeeting,
  useUpdateAttendance,
  useSaveMinutes,
  usePublishMinutes,
  useGenerateQr,
  useSignMinutes,
} from '@/hooks/useMeetings';
import * as meetingsApi from '@/api/meetings';

const MOCK_MEETING = {
  id: 'm1',
  title: 'Junta Ordinaria 2025',
  type: 'ORDINARY',
  status: 'SCHEDULED',
  scheduledAt: '2025-06-15T18:00:00Z',
  location: 'Salón comunal',
  agenda: '1. Presupuesto anual\n2. Obras',
  minutesPublished: false,
  minutesSigned: false,
  minutesUrl: null,
  minutesText: null,
  minutesUpdatedAt: null,
  minutes: null,
  minutesSignedAt: null,
  communityId: 'c1',
  attendees: [
    {
      id: 'a1',
      userId: 'user1',
      status: 'PENDING',
      proxyName: null,
      user: { id: 'user1', firstName: 'Ana', lastName: 'García' },
    },
    {
      id: 'a2',
      userId: 'user2',
      status: 'CONFIRMED',
      proxyName: null,
      user: { id: 'user2', firstName: 'Juan', lastName: 'López' },
    },
  ],
  polls: [],
};

// Route is /communities/:id/meetings/:meetingId
function renderPage({ asAdmin = false, meeting = MOCK_MEETING } = {}) {
  if (asAdmin) {
    useAuth.mockReturnValue({ user: { role: 'ADMIN_FINCAS', id: 'admin1' } });
  } else {
    useAuth.mockReturnValue({ user: { role: 'VECINO', id: 'user1' } });
  }
  useMeeting.mockReturnValue({ data: meeting, isLoading: false });

  return render(
    <MemoryRouter initialEntries={['/communities/c1/meetings/m1']}>
      <Routes>
        <Route path="/communities/:id/meetings/:meetingId" element={<MeetingDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MeetingDetailPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUpdateMeeting.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
    useUpdateAttendance.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
    useSaveMinutes.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
    usePublishMinutes.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useGenerateQr.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({ qrDataUrl: null, url: 'https://qr.test' }), isPending: false });
    useSignMinutes.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
  });

  // ─── Attendance status buttons (non-admin / VECINO) ──────────────────────────

  it('renders attendance status buttons for non-admin users', () => {
    renderPage({ asAdmin: false });
    expect(screen.getByRole('button', { name: /confirmo asistencia/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no asistiré/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pendiente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delego en/i })).toBeInTheDocument();
  });

  it('clicking CONFIRMED attendance button selects it', async () => {
    renderPage({ asAdmin: false });
    const user = userEvent.setup();

    const confirmedBtn = screen.getByRole('button', { name: /confirmo asistencia/i });
    await user.click(confirmedBtn);

    // After click the button should visually be selected (dark background class)
    expect(confirmedBtn.className).toMatch(/border-olive-700/);
  });

  it('clicking DECLINED attendance button selects it', async () => {
    renderPage({ asAdmin: false });
    const user = userEvent.setup();

    const declinedBtn = screen.getByRole('button', { name: /no asistiré/i });
    await user.click(declinedBtn);

    expect(declinedBtn.className).toMatch(/border-olive-700/);
  });

  it('clicking PENDING attendance button selects it', async () => {
    // Start from CONFIRMED so we can switch back to PENDING
    renderPage({
      asAdmin: false,
      meeting: {
        ...MOCK_MEETING,
        attendees: [
          {
            id: 'a1',
            userId: 'user1',
            status: 'CONFIRMED',
            proxyName: null,
            user: { id: 'user1', firstName: 'Ana', lastName: 'García' },
          },
        ],
      },
    });
    const user = userEvent.setup();

    // "Pendiente" button text (emoji is aria-hidden)
    const pendingBtn = screen.getByRole('button', { name: /^pendiente$/i });
    await user.click(pendingBtn);

    expect(pendingBtn.className).toMatch(/border-olive-700/);
  });

  // ─── Proxy name input when DELEGATED is selected ─────────────────────────────

  it('proxy name input is not shown by default', () => {
    renderPage({ asAdmin: false });
    expect(screen.queryByLabelText(/nombre del delegado/i)).not.toBeInTheDocument();
  });

  it('proxy name input appears when DELEGATED is selected', async () => {
    renderPage({ asAdmin: false });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /delego en/i }));

    expect(screen.getByLabelText(/nombre del delegado/i)).toBeInTheDocument();
  });

  it('user can type in proxy name input', async () => {
    renderPage({ asAdmin: false });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /delego en/i }));

    const proxyInput = screen.getByLabelText(/nombre del delegado/i);
    await user.type(proxyInput, 'Carlos Ruiz');
    expect(proxyInput).toHaveValue('Carlos Ruiz');
  });

  it('proxy name input disappears when another status is selected after DELEGATED', async () => {
    renderPage({ asAdmin: false });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /delego en/i }));
    expect(screen.getByLabelText(/nombre del delegado/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /confirmo asistencia/i }));
    expect(screen.queryByLabelText(/nombre del delegado/i)).not.toBeInTheDocument();
  });

  // ─── "Guardar" attendance button ─────────────────────────────────────────────

  it('"Guardar" button calls updateAttendance.mutateAsync with the selected status', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateAttendance.mockReturnValue({ mutateAsync, isPending: false });

    renderPage({ asAdmin: false });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /confirmo asistencia/i }));
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'CONFIRMED' })
      );
    });
  });

  it('"Guardar" calls updateAttendance with DECLINED when that status is selected', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateAttendance.mockReturnValue({ mutateAsync, isPending: false });

    renderPage({ asAdmin: false });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /no asistiré/i }));
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'DECLINED' })
      );
    });
  });

  it('"Guardar" with DELEGATED passes proxy name', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateAttendance.mockReturnValue({ mutateAsync, isPending: false });

    renderPage({ asAdmin: false });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /delego en/i }));
    await user.type(screen.getByLabelText(/nombre del delegado/i), 'María López');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'DELEGATED', proxy: 'María López' })
      );
    });
  });

  // ─── Admin: Status select for meeting ────────────────────────────────────────

  it('shows admin edit panel for admin users', () => {
    renderPage({ asAdmin: true });
    expect(screen.getByText(/editar junta/i)).toBeInTheDocument();
  });

  it('does not show attendance buttons for admin users', () => {
    renderPage({ asAdmin: true });
    expect(screen.queryByText(/mi asistencia/i)).not.toBeInTheDocument();
  });

  it('admin status select has current meeting status selected', () => {
    renderPage({ asAdmin: true });
    const statusSelect = screen.getByLabelText(/estado/i);
    expect(statusSelect).toHaveValue('SCHEDULED');
  });

  it('admin can change meeting status via select', async () => {
    renderPage({ asAdmin: true });
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/estado/i), 'CANCELLED');
    expect(screen.getByLabelText(/estado/i)).toHaveValue('CANCELLED');
  });

  // ─── Admin: Minutes textarea ─────────────────────────────────────────────────
  // Note: both "Acta" (textarea) and "URL del acta (PDF)" (input) match /acta/i,
  // so we target by id using document.getElementById or the exact label text "Acta".

  it('admin minutes textarea is rendered', () => {
    renderPage({ asAdmin: true });
    // getByRole('textbox') returns multiple; target the textarea specifically
    expect(document.getElementById('admin-minutes')).toBeInTheDocument();
  });

  it('admin can type meeting minutes', async () => {
    renderPage({ asAdmin: true });
    const user = userEvent.setup();

    const minutesArea = document.getElementById('admin-minutes');
    await user.type(minutesArea, 'Se aprueba el presupuesto por unanimidad.');
    expect(minutesArea).toHaveValue('Se aprueba el presupuesto por unanimidad.');
  });

  // ─── Admin: Minutes URL input ─────────────────────────────────────────────────

  it('admin minutes URL input is rendered', () => {
    renderPage({ asAdmin: true });
    expect(screen.getByLabelText(/url del acta/i)).toBeInTheDocument();
  });

  it('admin can type a minutes URL', async () => {
    renderPage({ asAdmin: true });
    const user = userEvent.setup();

    const urlInput = screen.getByLabelText(/url del acta/i);
    await user.type(urlInput, 'https://docs.example.com/acta.pdf');
    expect(urlInput).toHaveValue('https://docs.example.com/acta.pdf');
  });

  // ─── Admin: "Guardar cambios" button ─────────────────────────────────────────

  it('"Guardar cambios" button calls updateMeeting.mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateMeeting.mockReturnValue({ mutateAsync, isPending: false });

    renderPage({ asAdmin: true });
    const user = userEvent.setup();

    const minutesArea = document.getElementById('admin-minutes');
    await user.type(minutesArea, 'Acta de la reunión');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ minutes: 'Acta de la reunión' })
      );
    });
  });

  it('"Guardar cambios" passes minutesUrl when filled', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateMeeting.mockReturnValue({ mutateAsync, isPending: false });

    renderPage({ asAdmin: true });
    const user = userEvent.setup();

    await user.type(document.getElementById('admin-minutes-url'), 'https://example.com/acta.pdf');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ minutesUrl: 'https://example.com/acta.pdf' })
      );
    });
  });

  it('"Guardar cambios" clears inputs after successful save', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateMeeting.mockReturnValue({ mutateAsync, isPending: false });

    renderPage({ asAdmin: true });
    const user = userEvent.setup();

    const minutesArea = document.getElementById('admin-minutes');
    await user.type(minutesArea, 'Algo');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(document.getElementById('admin-minutes')).toHaveValue('');
    });
  });

  it('shows error alert when updateMeeting.mutateAsync rejects', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'No autorizado' } } },
    });
    useUpdateMeeting.mockReturnValue({ mutateAsync, isPending: false });

    renderPage({ asAdmin: true });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No autorizado');
    });
  });

  // ─── Admin: "Marcar como celebrada" button ────────────────────────────────────

  it('"Marcar como celebrada" button is shown when meeting is SCHEDULED', () => {
    renderPage({ asAdmin: true });
    expect(screen.getByRole('button', { name: /marcar como celebrada/i })).toBeInTheDocument();
  });

  it('"Marcar como celebrada" button is not shown when meeting is HELD', () => {
    renderPage({ asAdmin: true, meeting: { ...MOCK_MEETING, status: 'HELD' } });
    expect(screen.queryByRole('button', { name: /marcar como celebrada/i })).not.toBeInTheDocument();
  });

  it('"Marcar como celebrada" button calls updateMeeting.mutateAsync with status HELD', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateMeeting.mockReturnValue({ mutateAsync, isPending: false });

    renderPage({ asAdmin: true });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /marcar como celebrada/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ status: 'HELD' });
    });
  });

  // ─── Admin: "Publicar acta para vecinos" toggle button ───────────────────────

  it('"Publicar acta para vecinos" button is shown when meeting has minutes', () => {
    renderPage({
      asAdmin: true,
      meeting: { ...MOCK_MEETING, minutes: 'Texto del acta', minutesPublished: false },
    });
    expect(screen.getByRole('button', { name: /publicar acta para vecinos/i })).toBeInTheDocument();
  });

  it('"Publicar acta para vecinos" button is NOT shown without minutes', () => {
    renderPage({ asAdmin: true, meeting: { ...MOCK_MEETING, minutes: null } });
    expect(screen.queryByRole('button', { name: /publicar acta para vecinos/i })).not.toBeInTheDocument();
  });

  it('"Publicar acta para vecinos" calls publishMinutes.mutate with true', async () => {
    const mutate = vi.fn();
    usePublishMinutes.mockReturnValue({ mutate, isPending: false });

    renderPage({
      asAdmin: true,
      meeting: { ...MOCK_MEETING, minutes: 'Acta', minutesPublished: false },
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /publicar acta para vecinos/i }));

    expect(mutate).toHaveBeenCalledWith(true);
  });

  it('shows "Retirar publicación" when minutes are already published, calls mutate with false', async () => {
    const mutate = vi.fn();
    usePublishMinutes.mockReturnValue({ mutate, isPending: false });

    renderPage({
      asAdmin: true,
      meeting: { ...MOCK_MEETING, minutes: 'Acta', minutesPublished: true },
    });

    const user = userEvent.setup();
    const unpublishBtn = screen.getByRole('button', { name: /retirar publicación/i });
    expect(unpublishBtn).toBeInTheDocument();
    await user.click(unpublishBtn);

    expect(mutate).toHaveBeenCalledWith(false);
  });

  // ─── Download convocatoria button ─────────────────────────────────────────────

  it('download convocatoria button is shown for admin users', () => {
    renderPage({ asAdmin: true });
    // The button text includes the translation key "meetings.downloadConvocatoria"
    expect(screen.getByRole('button', { name: /descargar convocatoria/i })).toBeInTheDocument();
  });

  it('clicking download convocatoria calls downloadConvocatoria with meeting id', async () => {
    renderPage({ asAdmin: true });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /descargar convocatoria/i }));

    await waitFor(() => {
      expect(meetingsApi.downloadConvocatoria).toHaveBeenCalledWith('m1');
    });
  });

  // ─── Download minutes PDF button ─────────────────────────────────────────────

  it('download minutes PDF button is shown when minutes are published and text exists', () => {
    renderPage({
      asAdmin: true,
      meeting: { ...MOCK_MEETING, minutes: 'Texto del acta', minutesPublished: true },
    });
    expect(screen.getByRole('button', { name: /descargar acta en pdf/i })).toBeInTheDocument();
  });

  it('clicking download minutes PDF calls downloadMinutesPdf with meeting id', async () => {
    renderPage({
      asAdmin: true,
      meeting: { ...MOCK_MEETING, minutes: 'Texto del acta', minutesPublished: true },
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /descargar acta en pdf/i }));

    await waitFor(() => {
      expect(meetingsApi.downloadMinutesPdf).toHaveBeenCalledWith('m1');
    });
  });

  // ─── Attendees table ──────────────────────────────────────────────────────────

  it('renders the attendees table with attendee names', () => {
    renderPage({ asAdmin: true });
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('Juan López')).toBeInTheDocument();
  });

  // ─── Meeting header info ──────────────────────────────────────────────────────

  it('renders meeting title and location', () => {
    renderPage({ asAdmin: false });
    expect(screen.getByText('Junta Ordinaria 2025')).toBeInTheDocument();
    expect(screen.getByText(/salón comunal/i)).toBeInTheDocument();
  });

  it('renders agenda content', () => {
    renderPage({ asAdmin: false });
    expect(screen.getByText(/presupuesto anual/i)).toBeInTheDocument();
  });
});
