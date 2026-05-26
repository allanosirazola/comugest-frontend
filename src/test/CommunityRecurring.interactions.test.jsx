import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@/i18n';
import { CommunityRecurringPage } from '@/pages/CommunityRecurring';

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

// StatusBadge/formatMoney/formatDate are used from @/components/StatusBadge
vi.mock('@/components/StatusBadge', () => ({
  formatMoney: (v) => `${v} €`,
  formatDate: (v) => v,
}));

vi.mock('@/hooks/useRecurring', () => ({
  useRecurring: vi.fn(),
  useCreateRecurring: vi.fn(),
  useUpdateRecurring: vi.fn(),
  useTriggerRecurring: vi.fn(),
}));

import { useRecurring, useCreateRecurring, useUpdateRecurring, useTriggerRecurring } from '@/hooks/useRecurring';

const MOCK_RECURRING_ITEM = {
  id: 'r1',
  concept: 'Cuota mensual',
  description: 'Cuota fija',
  frequency: 'MONTHLY',
  amount: 50,
  active: true,
  nextBillingAt: null,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communities/c1/recurring']}>
      <Routes>
        <Route path="/communities/:id/recurring" element={<CommunityRecurringPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function setupDefaultMocks({
  recurring = [],
  createMutateAsync = vi.fn().mockResolvedValue({}),
  updateMutateAsync = vi.fn().mockResolvedValue({}),
  triggerMutateAsync = vi.fn().mockResolvedValue({}),
} = {}) {
  useRecurring.mockReturnValue({ data: { recurring }, isLoading: false });
  useCreateRecurring.mockReturnValue({ mutateAsync: createMutateAsync, isPending: false });
  useUpdateRecurring.mockReturnValue({ mutateAsync: updateMutateAsync, isPending: false });
  useTriggerRecurring.mockReturnValue({ mutateAsync: triggerMutateAsync, isPending: false });
}

describe('CommunityRecurringPage interactions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title and "Nueva cuota" button', () => {
    setupDefaultMocks();
    renderPage();
    expect(screen.getByText(/cuotas ordinarias/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nueva cuota/i })).toBeInTheDocument();
  });

  it('"Nueva cuota" button toggles the form open', async () => {
    setupDefaultMocks();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva cuota/i }));

    expect(screen.getByLabelText(/concepto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frecuencia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/importe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/día del mes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de inicio/i)).toBeInTheDocument();
  });

  it('cancel button hides the form', async () => {
    setupDefaultMocks();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva cuota/i }));
    expect(screen.getByLabelText(/concepto/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByLabelText(/concepto/i)).not.toBeInTheDocument();
  });

  it('fills form and calls createRecurring.mutateAsync on submit', async () => {
    const createMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ createMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva cuota/i }));

    await user.type(screen.getByLabelText(/concepto/i), 'Cuota comunidad');
    await user.selectOptions(screen.getByLabelText(/frecuencia/i), 'MONTHLY');
    await user.type(screen.getByLabelText(/descripción/i), 'Descripción cuota');
    await user.type(screen.getByLabelText(/importe/i), '75');
    await user.type(screen.getByLabelText(/día del mes/i), '5');
    await user.type(screen.getByLabelText(/fecha de inicio/i), '2025-01-01');

    await user.click(screen.getByRole('button', { name: /crear cuota/i }));

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          concept: 'Cuota comunidad',
          frequency: 'MONTHLY',
          description: 'Descripción cuota',
          amount: 75,
          dayOfMonth: 5,
          startAt: '2025-01-01',
        })
      );
    });
  });

  it('shows error alert when createRecurring.mutateAsync rejects', async () => {
    const createMutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Importe no válido' } } },
    });
    setupDefaultMocks({ createMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva cuota/i }));
    await user.type(screen.getByLabelText(/concepto/i), 'Cuota X');
    await user.type(screen.getByLabelText(/importe/i), '0');

    await user.click(screen.getByRole('button', { name: /crear cuota/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Importe no válido');
    });
  });

  it('"Activar/Desactivar" toggle calls updateRecurring.mutateAsync', async () => {
    const updateMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ recurring: [MOCK_RECURRING_ITEM], updateMutateAsync });
    const user = userEvent.setup();
    renderPage();

    // Active item should show "Desactivar" button
    const deactivateBtn = screen.getByRole('button', { name: /desactivar/i });
    await user.click(deactivateBtn);

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 'r1',
        input: { active: false },
      });
    });
  });

  it('"Activar" button calls updateRecurring.mutateAsync with active: true', async () => {
    const updateMutateAsync = vi.fn().mockResolvedValue({});
    const inactiveItem = { ...MOCK_RECURRING_ITEM, active: false };
    setupDefaultMocks({ recurring: [inactiveItem], updateMutateAsync });
    const user = userEvent.setup();
    renderPage();

    const activateBtn = screen.getByRole('button', { name: /^activar$/i });
    await user.click(activateBtn);

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 'r1',
        input: { active: true },
      });
    });
  });

  it('"Generar ahora" button calls triggerRecurring.mutateAsync', async () => {
    const triggerMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ recurring: [MOCK_RECURRING_ITEM], triggerMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /generar ahora/i }));

    await waitFor(() => {
      expect(triggerMutateAsync).toHaveBeenCalledWith('r1');
    });
  });

  it('shows trigger success status after successful trigger', async () => {
    const triggerMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ recurring: [MOCK_RECURRING_ITEM], triggerMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /generar ahora/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/factura generada correctamente/i);
    });
  });

  it('shows empty state when no recurring items exist', () => {
    setupDefaultMocks({ recurring: [] });
    renderPage();
    expect(screen.getByText(/no hay cuotas configuradas/i)).toBeInTheDocument();
  });

  it('renders recurring item when data exists', () => {
    setupDefaultMocks({ recurring: [MOCK_RECURRING_ITEM] });
    renderPage();
    expect(screen.getByText('Cuota mensual')).toBeInTheDocument();
    // Use exact match to avoid hitting "Desactivar" which also contains "activa"
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });
});
