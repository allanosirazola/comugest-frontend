import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CommunityMeterReadingsPage } from '@/pages/CommunityMeterReadings';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

vi.mock('@/hooks/useMeterReadings', () => ({
  useMeterReadings: vi.fn(),
  useCreateReading: vi.fn(),
  useDeleteReading: vi.fn(),
}));

import { useCommunity } from '@/hooks/useCommunities';
import { useMeterReadings, useCreateReading, useDeleteReading } from '@/hooks/useMeterReadings';

const UNITS = [
  { id: 'u1', type: 'VIVIENDA', label: '1ºA' },
  { id: 'u2', type: 'VIVIENDA', label: '2ºB' },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communities/c1']}>
      <Routes>
        <Route path="/communities/:id" element={<CommunityMeterReadingsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CommunityMeterReadingsPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useCommunity.mockReturnValue({
      data: { id: 'c1', name: 'Comunidad Test', units: UNITS },
    });
    useMeterReadings.mockReturnValue({ data: [], isLoading: false });
    useCreateReading.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
    useDeleteReading.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
  });

  it('renders the page with "Añadir lectura" button', () => {
    renderPage();
    // es: meters.addReading → "Añadir lectura"
    expect(screen.getByRole('button', { name: /añadir lectura/i })).toBeInTheDocument();
  });

  it('"Añadir lectura" button toggles the create form on/off', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir lectura/i }));

    // Form selects and inputs appear
    // es: meters.selectUnit → "Seleccionar unidad"
    expect(screen.getByRole('option', { name: /seleccionar unidad/i })).toBeInTheDocument();

    // es: common.cancel → "Cancelar" (toggle button)
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByRole('option', { name: /seleccionar unidad/i })).not.toBeInTheDocument();
  });

  it('fills all form fields and submits, calling createReading.mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreateReading.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir lectura/i }));

    // Unit select — first select in the form
    const formSelects = screen.getAllByRole('combobox');
    // The form has two selects (unit, type) — filter selects appear outside form
    // Unit select is the first one inside the form, which has the "Seleccionar unidad" option
    const unitSelect = formSelects.find((s) =>
      Array.from(s.options ?? []).some((o) => /seleccionar unidad/i.test(o.textContent))
    );
    await user.selectOptions(unitSelect, 'u1');

    // Type select — has AGUA, LUZ, GAS, OTRO
    const typeSelect = formSelects.find((s) =>
      Array.from(s.options ?? []).some((o) => /agua/i.test(o.textContent))
    );
    // Switch to LUZ
    await user.selectOptions(typeSelect, 'LUZ');

    // Date input (type="date") — first date input
    const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    // Pick the one inside the form (not filter area)
    const dateInput = dateInputs[0];
    await user.clear(dateInput);
    await user.type(dateInput, '2026-04-01');

    // Value input — es: meters.fieldValue → "Lectura (m³ / kWh)" (placeholder)
    const valueInput = screen.getByPlaceholderText(/lectura/i);
    await user.type(valueInput, '123.456');

    // Notes input — es: meters.fieldNotes → "Notas (opcional)" (placeholder)
    const notesInput = screen.getByPlaceholderText(/notas \(opcional\)/i);
    await user.type(notesInput, 'Lectura mensual');

    // Submit — button text is "Añadir lectura"
    await user.click(screen.getByRole('button', { name: /añadir lectura/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          unitId: 'u1',
          type: 'LUZ',
          value: 123.456,
          notes: 'Lectura mensual',
        })
      );
    });
  });

  it('shows error alert when createReading.mutateAsync rejects', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Valor de lectura no válido' } } },
    });
    useCreateReading.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir lectura/i }));

    // Select a unit so the form is valid enough to attempt submit
    const unitSelect = screen.getAllByRole('combobox').find((s) =>
      Array.from(s.options ?? []).some((o) => /seleccionar unidad/i.test(o.textContent))
    );
    await user.selectOptions(unitSelect, 'u1');

    const valueInput = screen.getByPlaceholderText(/lectura/i);
    await user.type(valueInput, '-5');

    await user.click(screen.getByRole('button', { name: /añadir lectura/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Valor de lectura no válido');
    });
  });

  it('filter type dropdown updates the type filter', async () => {
    const user = userEvent.setup();
    renderPage();

    // Filter selects are outside the form. Find the type filter
    // It has "Todos los tipos" as the first option (es: meters.allTypes)
    const typeFilterSelect = screen.getAllByRole('combobox').find((s) =>
      Array.from(s.options ?? []).some((o) => /todos los tipos/i.test(o.textContent))
    );
    await user.selectOptions(typeFilterSelect, 'GAS');

    await waitFor(() => {
      expect(useMeterReadings).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({ type: 'GAS' })
      );
    });
  });

  it('filter unit dropdown updates the unit filter', async () => {
    const user = userEvent.setup();
    renderPage();

    // Unit filter has "Todas las unidades" as first option (es: meters.allUnits)
    const unitFilterSelect = screen.getAllByRole('combobox').find((s) =>
      Array.from(s.options ?? []).some((o) => /todas las unidades/i.test(o.textContent))
    );
    await user.selectOptions(unitFilterSelect, 'u2');

    await waitFor(() => {
      expect(useMeterReadings).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({ unitId: 'u2' })
      );
    });
  });

  it('delete button (aria-label "Eliminar") calls deleteReading.mutateAsync after confirm', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useDeleteReading.mockReturnValue({ mutateAsync });
    useMeterReadings.mockReturnValue({
      data: [
        {
          id: 'r1',
          unit: { type: 'VIVIENDA', label: '1ºA' },
          type: 'AGUA',
          readingDate: '2026-03-01',
          value: '245.678',
          consumption: null,
          notes: null,
        },
      ],
      isLoading: false,
    });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const user = userEvent.setup();
    renderPage();

    // es: common.remove → "Eliminar" (aria-label on the ✕ button)
    const deleteBtn = screen.getByRole('button', { name: /eliminar/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('r1');
    });
  });

  it('does not delete when user cancels the confirm dialog', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useDeleteReading.mockReturnValue({ mutateAsync });
    useMeterReadings.mockReturnValue({
      data: [
        {
          id: 'r1',
          unit: { type: 'VIVIENDA', label: '1ºA' },
          type: 'AGUA',
          readingDate: '2026-03-01',
          value: '245.678',
          consumption: null,
          notes: null,
        },
      ],
      isLoading: false,
    });

    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('renders reading rows in the table', () => {
    useMeterReadings.mockReturnValue({
      data: [
        {
          id: 'r1',
          unit: { type: 'VIVIENDA', label: '3ºC' },
          type: 'AGUA',
          readingDate: '2026-03-01',
          value: '100.000',
          consumption: '5.000',
          notes: 'Sin novedad',
        },
      ],
      isLoading: false,
    });

    renderPage();

    expect(screen.getByText(/3ºC/)).toBeInTheDocument();
    // es: meters.type.agua → "Agua" — multiple elements may have this text (filter dropdown + badge)
    const aguaElements = screen.getAllByText(/^agua$/i);
    expect(aguaElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Sin novedad')).toBeInTheDocument();
  });
});
