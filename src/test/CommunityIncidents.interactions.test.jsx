import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@/i18n';
import { CommunityIncidentsPage } from '@/pages/CommunityIncidents';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'u1', role: 'ADMIN_FINCAS' },
  }),
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn().mockReturnValue({ data: { id: 'c1', name: 'Test Community' } }),
}));

vi.mock('@/hooks/useIncidents', () => ({
  useIncidents: vi.fn(),
  useCreateIncident: vi.fn(),
  useUpdateIncidentStatus: vi.fn(),
  useAddIncidentPhoto: vi.fn(),
  useRemoveIncidentPhoto: vi.fn(),
}));

import {
  useIncidents,
  useCreateIncident,
  useUpdateIncidentStatus,
  useAddIncidentPhoto,
  useRemoveIncidentPhoto,
} from '@/hooks/useIncidents';

const MOCK_INCIDENT = {
  id: 'i1',
  title: 'Gotera en el tejado',
  description: 'Hay una gotera importante',
  category: 'STRUCTURAL',
  status: 'OPEN',
  resolution: '',
  photos: [],
  createdAt: '2024-03-10T09:00:00Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communities/c1/incidents']}>
      <Routes>
        <Route path="/communities/:id/incidents" element={<CommunityIncidentsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function setupDefaultMocks({
  incidents = [],
  createMutateAsync = vi.fn().mockResolvedValue({}),
  updateStatusMutateAsync = vi.fn().mockResolvedValue({}),
  addPhotoMutate = vi.fn(),
  removePhotoMutate = vi.fn(),
} = {}) {
  useIncidents.mockReturnValue({ data: incidents, isLoading: false });
  useCreateIncident.mockReturnValue({ mutateAsync: createMutateAsync, isPending: false });
  useUpdateIncidentStatus.mockReturnValue({ mutateAsync: updateStatusMutateAsync, isPending: false });
  useAddIncidentPhoto.mockReturnValue({ mutate: addPhotoMutate, isPending: false });
  useRemoveIncidentPhoto.mockReturnValue({ mutate: removePhotoMutate, isPending: false });
}

describe('CommunityIncidentsPage interactions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title and "Nueva incidencia" button', () => {
    setupDefaultMocks();
    renderPage();
    expect(screen.getByRole('heading', { name: /incidencias/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ nueva incidencia/i })).toBeInTheDocument();
  });

  it('"Nueva incidencia" button opens the modal with title, category, and description inputs', async () => {
    setupDefaultMocks();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva incidencia/i }));

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it('modal has a close/cancel button that closes it', async () => {
    setupDefaultMocks();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva incidencia/i }));
    expect(screen.getByLabelText(/cancelar/i)).toBeInTheDocument();

    // Click the ✕ close button (aria-label="Cancelar")
    await user.click(screen.getByLabelText(/cancelar/i));

    // Modal title should be gone
    await waitFor(() => {
      expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
    });
  });

  it('cancel button inside modal footer also closes the modal', async () => {
    setupDefaultMocks();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva incidencia/i }));

    // There is a "Cancelar" button in the form footer
    const cancelBtns = screen.getAllByRole('button', { name: /cancelar/i });
    await user.click(cancelBtns[cancelBtns.length - 1]);

    await waitFor(() => {
      expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
    });
  });

  it('fills modal form and calls createIncident.mutateAsync on submit', async () => {
    const createMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ createMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva incidencia/i }));

    await user.type(screen.getByLabelText(/título/i), 'Ascensor averiado');
    await user.selectOptions(screen.getByLabelText(/categoría/i), 'LIFT');
    await user.type(screen.getByLabelText(/descripción/i), 'El ascensor no funciona desde ayer');

    // The modal submit button text is "Nueva incidencia" (exact, no "+" prefix)
    // Use exact accessible name to distinguish from the page button "+ Nueva incidencia"
    await user.click(screen.getByRole('button', { name: 'Nueva incidencia' }));

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        title: 'Ascensor averiado',
        description: 'El ascensor no funciona desde ayer',
        category: 'LIFT',
      });
    });
  });

  it('shows error alert when createIncident.mutateAsync rejects', async () => {
    const createMutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Error al crear la incidencia' } } },
    });
    setupDefaultMocks({ createMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /\+ nueva incidencia/i }));
    await user.type(screen.getByLabelText(/título/i), 'Incidencia fallida');

    // The modal submit button has exact text "Nueva incidencia" (no "+" prefix)
    await user.click(screen.getByRole('button', { name: 'Nueva incidencia' }));

    await waitFor(() => {
      // createError is displayed in the page (modal stays open on error)
      expect(screen.getByRole('alert')).toHaveTextContent('Error al crear la incidencia');
    });
  });

  it('clicking an incident row expands it to show status select', async () => {
    setupDefaultMocks({ incidents: [MOCK_INCIDENT] });
    const user = userEvent.setup();
    renderPage();

    // Click the row to expand it
    const row = screen.getByText('Gotera en el tejado').closest('tr');
    await user.click(row);

    await waitFor(() => {
      // Status select appears with id `status-i1`
      expect(screen.getByRole('combobox', { name: /estado/i })).toBeInTheDocument();
    });
  });

  it('status select change and save calls updateIncidentStatus.mutateAsync', async () => {
    const updateStatusMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ incidents: [MOCK_INCIDENT], updateStatusMutateAsync });
    const user = userEvent.setup();
    renderPage();

    // Expand the incident row
    const row = screen.getByText('Gotera en el tejado').closest('tr');
    await user.click(row);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /estado/i })).toBeInTheDocument();
    });

    // Change status to IN_PROGRESS
    await user.selectOptions(screen.getByRole('combobox', { name: /estado/i }), 'IN_PROGRESS');

    // Click save button
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(updateStatusMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          incidentId: 'i1',
          status: 'IN_PROGRESS',
        })
      );
    });
  });

  it('shows empty table message when no incidents match filter', () => {
    setupDefaultMocks({ incidents: [] });
    renderPage();
    expect(screen.getByText(/no hay incidencias que coincidan/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    useIncidents.mockReturnValue({ data: [], isLoading: true });
    useCreateIncident.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useUpdateIncidentStatus.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useAddIncidentPhoto.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useRemoveIncidentPhoto.mockReturnValue({ mutate: vi.fn(), isPending: false });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renders incident in the table when data exists', () => {
    setupDefaultMocks({ incidents: [MOCK_INCIDENT] });
    renderPage();
    expect(screen.getByText('Gotera en el tejado')).toBeInTheDocument();
  });
});
