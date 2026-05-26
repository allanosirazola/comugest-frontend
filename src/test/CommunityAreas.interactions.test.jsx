import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CommunityAreasPage } from '@/pages/CommunityAreas';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

vi.mock('@/hooks/useAreas', () => ({
  useAreas: vi.fn(),
  useCreateArea: vi.fn(),
  useUpdateArea: vi.fn(),
  useDeleteArea: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/hooks/useCommunities';
import { useAreas, useCreateArea, useUpdateArea, useDeleteArea } from '@/hooks/useAreas';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communities/c1']}>
      <Routes>
        <Route path="/communities/:id" element={<CommunityAreasPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const adminUser = { id: 'u1', role: 'ADMIN_FINCAS', firstName: 'Admin', lastName: 'Test' };
const residentUser = { id: 'u2', role: 'RESIDENT', firstName: 'Vecino', lastName: 'Test' };

describe('CommunityAreasPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({ user: adminUser });
    useCommunity.mockReturnValue({ data: { id: 'c1', name: 'Test Community' } });
    useAreas.mockReturnValue({ data: { areas: [] }, isLoading: false });
    useCreateArea.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
    useUpdateArea.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
    useDeleteArea.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
  });

  it('shows "+" button only for ADMIN users', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /nueva zona/i })).toBeInTheDocument();
  });

  it('does not show "+" button for non-admin users', () => {
    useAuth.mockReturnValue({ user: residentUser });
    renderPage();
    expect(screen.queryByRole('button', { name: /nueva zona/i })).not.toBeInTheDocument();
  });

  it('"+" button toggles the area creation form', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva zona/i }));
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByLabelText(/nombre/i)).not.toBeInTheDocument();
  });

  it('fills all form fields and submits, calling createArea.mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreateArea.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva zona/i }));

    // Name
    await user.clear(screen.getByLabelText(/nombre/i));
    await user.type(screen.getByLabelText(/nombre/i), 'Piscina');

    // Capacity
    const capacityInput = screen.getByLabelText(/aforo máx/i);
    await user.clear(capacityInput);
    await user.type(capacityInput, '20');

    // Description
    await user.type(screen.getByLabelText(/descripción/i), 'Zona de piscina comunitaria');

    // openTime
    const openTimeInput = document.getElementById('area-openTime');
    await user.clear(openTimeInput);
    await user.type(openTimeInput, '09:00');

    // closeTime
    const closeTimeInput = document.getElementById('area-closeTime');
    await user.clear(closeTimeInput);
    await user.type(closeTimeInput, '21:00');

    // slotMinutes select — select "30 min" (value=30)
    await user.selectOptions(document.getElementById('area-slotMinutes'), '30');

    // maxSlotsPerDay
    const maxSlotsInput = document.getElementById('area-maxSlotsPerDay');
    await user.clear(maxSlotsInput);
    await user.type(maxSlotsInput, '2');

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Piscina',
          capacity: 20,
          description: 'Zona de piscina comunitaria',
          slotMinutes: 30,
          maxSlotsPerDay: 2,
        })
      );
    });
  });

  it('shows error alert when createArea.mutateAsync rejects', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Nombre ya existe' } } },
    });
    useCreateArea.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva zona/i }));
    await user.type(screen.getByLabelText(/nombre/i), 'Sala');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Nombre ya existe');
    });
  });

  it('"Desactivar" button calls deleteArea.mutateAsync after confirm (active area)', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useDeleteArea.mockReturnValue({ mutateAsync, isPending: false });
    useAreas.mockReturnValue({
      data: {
        areas: [
          {
            id: 'area1',
            name: 'Piscina',
            active: true,
            description: null,
            capacity: null,
            openTime: '08:00',
            closeTime: '22:00',
            slotMinutes: 60,
            todayConfirmedCount: 0,
          },
        ],
      },
      isLoading: false,
    });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const user = userEvent.setup();
    renderPage();

    const deactivateBtn = screen.getByRole('button', { name: /desactivar/i });
    await user.click(deactivateBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('area1');
    });
  });

  it('"Activar" button calls updateArea.mutateAsync (inactive area)', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useUpdateArea.mockReturnValue({ mutateAsync, isPending: false });
    useAreas.mockReturnValue({
      data: {
        areas: [
          {
            id: 'area2',
            name: 'Sala reuniones',
            active: false,
            description: null,
            capacity: null,
            openTime: '08:00',
            closeTime: '22:00',
            slotMinutes: 60,
            todayConfirmedCount: 0,
          },
        ],
      },
      isLoading: false,
    });

    const user = userEvent.setup();
    renderPage();

    const activateBtn = screen.getByRole('button', { name: /activar/i });
    await user.click(activateBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ id: 'area2', input: { active: true } });
    });
  });

  it('"Ver reservas" link navigates to reservations', () => {
    useAreas.mockReturnValue({
      data: {
        areas: [
          {
            id: 'area1',
            name: 'Piscina',
            active: true,
            description: null,
            capacity: null,
            openTime: '08:00',
            closeTime: '22:00',
            slotMinutes: 60,
            todayConfirmedCount: 0,
          },
        ],
      },
      isLoading: false,
    });

    renderPage();

    const link = screen.getByRole('link', { name: /ver reservas/i });
    expect(link).toHaveAttribute('href', '/communities/c1/areas/area1/reservations');
  });

  it('does not deactivate when user cancels the confirm dialog', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useDeleteArea.mockReturnValue({ mutateAsync, isPending: false });
    useAreas.mockReturnValue({
      data: {
        areas: [
          {
            id: 'area1',
            name: 'Piscina',
            active: true,
            description: null,
            capacity: null,
            openTime: '08:00',
            closeTime: '22:00',
            slotMinutes: 60,
            todayConfirmedCount: 0,
          },
        ],
      },
      isLoading: false,
    });

    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /desactivar/i }));
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
