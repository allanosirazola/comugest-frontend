import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CreateInvoicePage } from '@/pages/CreateInvoice';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatMoney: (v) => `${Number(v).toFixed(2)} €`,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
  useUnits: vi.fn(),
}));

vi.mock('@/hooks/useInvoices', () => ({
  useCreateInvoice: vi.fn(),
}));

import { useCommunity, useUnits } from '@/hooks/useCommunities';
import { useCreateInvoice } from '@/hooks/useInvoices';

const MOCK_COMMUNITY = { id: 'c1', name: 'Residencial Olivos' };

const MOCK_UNITS = [
  { id: 'u1', label: '1ºA', type: 'VIVIENDA', coefficient: '50.00' },
  { id: 'u2', label: '1ºB', type: 'VIVIENDA', coefficient: '50.00' },
];

function renderPage(id = 'c1') {
  return render(
    <MemoryRouter initialEntries={[`/communities/${id}/invoices/new`]}>
      <Routes>
        <Route path="/communities/:id/invoices/new" element={<CreateInvoicePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CreateInvoicePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCommunity.mockReturnValue({ data: MOCK_COMMUNITY });
    useUnits.mockReturnValue({ data: MOCK_UNITS });
    useCreateInvoice.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it('renders community name', () => {
    renderPage();
    expect(screen.getByText('Residencial Olivos')).toBeInTheDocument();
  });

  it('renders concept and due date fields', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /emitir/i })).toBeInTheDocument();
  });

  it('shows derrama mode by default with total amount field', () => {
    renderPage();
    expect(screen.getByText(/tipo de factura/i)).toBeInTheDocument();
  });

  it('shows distribution preview when total amount is entered', async () => {
    const user = userEvent.setup();
    renderPage();

    const totalInput = screen.getByLabelText(/importe total/i);
    await user.type(totalInput, '1000');

    await waitFor(() => {
      expect(screen.getByText('1ºA')).toBeInTheDocument();
    });
  });

  it('switches to individual mode and shows per-unit table', async () => {
    const user = userEvent.setup();
    renderPage();

    const individualBtn = screen.getByRole('button', { name: /individual/i });
    await user.click(individualBtn);

    await waitFor(() => {
      expect(screen.getByText(/importe por unidad/i)).toBeInTheDocument();
    });
    expect(screen.getByText('1ºA')).toBeInTheDocument();
    expect(screen.getByText('1ºB')).toBeInTheDocument();
  });

  it('shows error when individual mode submitted with no amounts', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /individual/i }));

    const conceptInput = screen.getByLabelText(/^concepto$/i);
    await user.type(conceptInput, 'Agua');

    const dueDateInput = screen.getByLabelText(/vencimiento/i);
    await user.type(dueDateInput, '2025-12-31');

    await user.click(screen.getByRole('button', { name: /emitir/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows loading state on submit button while pending', () => {
    useCreateInvoice.mockReturnValue({ mutateAsync: vi.fn(), isPending: true });
    renderPage();
    expect(screen.getByRole('button', { name: /cargando/i })).toBeInTheDocument();
  });
});
