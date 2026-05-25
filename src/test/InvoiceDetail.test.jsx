import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { InvoiceDetailPage } from '@/pages/InvoiceDetail';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }) => <span>{status}</span>,
  formatMoney: (v) => `${Number(v).toFixed(2)} €`,
  formatDate: (d) => d,
}));

vi.mock('@/hooks/useInvoices', () => ({
  useInvoice: vi.fn(),
  useRecordPayment: vi.fn(),
  useDeletePayment: vi.fn(),
  useCancelInvoice: vi.fn(),
  useDownloadSepa: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useDownloadPdf: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
}));

import { useInvoice, useRecordPayment, useDeletePayment, useCancelInvoice } from '@/hooks/useInvoices';

const MOCK_INVOICE = {
  id: 'inv-1',
  concept: 'Cuota Enero',
  type: 'DERRAMA',
  description: 'Derrama para ascensor.',
  status: 'PARTIALLY_PAID',
  total: 1500,
  paidAmount: 750,
  pendingAmount: 750,
  dueDate: '2024-01-31',
  attachmentUrl: null,
  communityId: 'c1',
  items: [{
    id: 'item-1',
    amount: '150.00',
    status: 'PENDING',
    consumptionValue: null,
    consumptionUnit: null,
    payments: [],
    unit: { label: '1ºA' },
  }],
};

function renderPage(id = 'inv-1') {
  return render(
    <MemoryRouter initialEntries={[`/invoices/${id}`]}>
      <Routes>
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('InvoiceDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRecordPayment.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useDeletePayment.mockReturnValue({ mutateAsync: vi.fn() });
    useCancelInvoice.mockReturnValue({ mutateAsync: vi.fn() });
  });

  it('shows loading state', () => {
    useInvoice.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renders invoice concept and stats', () => {
    useInvoice.mockReturnValue({ data: MOCK_INVOICE, isLoading: false });
    renderPage();
    expect(screen.getByText('Cuota Enero')).toBeInTheDocument();
    expect(screen.getByText('Derrama para ascensor.')).toBeInTheDocument();
  });

  it('renders items table', () => {
    useInvoice.mockReturnValue({ data: MOCK_INVOICE, isLoading: false });
    renderPage();
    expect(screen.getByText('1ºA')).toBeInTheDocument();
  });

  it('shows register payment button for unpaid items', () => {
    useInvoice.mockReturnValue({ data: MOCK_INVOICE, isLoading: false });
    renderPage();
    expect(screen.getByRole('button', { name: /registrar pago/i })).toBeInTheDocument();
  });

  it('opens payment form when register button clicked', async () => {
    useInvoice.mockReturnValue({ data: MOCK_INVOICE, isLoading: false });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /registrar pago/i }));

    expect(screen.getByRole('button', { name: /^guardar$/i })).toBeInTheDocument();
  });

  it('shows cancel button for non-cancelled invoice', () => {
    useInvoice.mockReturnValue({ data: MOCK_INVOICE, isLoading: false });
    renderPage();
    expect(screen.getByRole('button', { name: /cancelar factura/i })).toBeInTheDocument();
  });

  it('does not show cancel button for cancelled invoice', () => {
    useInvoice.mockReturnValue({ data: { ...MOCK_INVOICE, status: 'CANCELLED' }, isLoading: false });
    renderPage();
    expect(screen.queryByRole('button', { name: /cancelar factura/i })).not.toBeInTheDocument();
  });
});
