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
  StatusBadge: () => null,
  formatDate: (v) => v,
  formatMoney: (v) => `${v} €`,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { role: 'ADMIN_FINCAS', id: 'user1' } }),
  AuthProvider: ({ children }) => children,
}));

vi.mock('@/hooks/useInvoices', () => ({
  useInvoice: vi.fn(),
  useRecordPayment: vi.fn(),
  useDeletePayment: vi.fn(),
  useCancelInvoice: vi.fn(),
  useDownloadSepa: vi.fn(),
  useDownloadPdf: vi.fn(),
}));

vi.mock('@/api/invoices', () => ({
  generateSepa: vi.fn(),
  downloadInvoicePdf: vi.fn(),
}));

import {
  useInvoice,
  useRecordPayment,
  useDeletePayment,
  useCancelInvoice,
  useDownloadSepa,
  useDownloadPdf,
} from '@/hooks/useInvoices';

const MOCK_INVOICE = {
  id: 'inv1',
  concept: 'Agua Q1 2025',
  type: 'INDIVIDUAL',
  status: 'ACTIVE',
  total: 200,
  paidAmount: 50,
  pendingAmount: 150,
  dueDate: '2025-03-31',
  communityId: 'c1',
  items: [
    {
      id: 'item1',
      unit: { id: 'u1', label: '1ºA' },
      amount: 100,
      paidAmount: 50,
      pendingAmount: 50,
      status: 'PARTIAL',
      payments: [
        { id: 'pay1', amount: 50, paidAt: '2025-01-15', method: 'TRANSFER', reference: 'REF001' },
      ],
    },
    {
      id: 'item2',
      unit: { id: 'u2', label: '1ºB' },
      amount: 100,
      paidAmount: 0,
      pendingAmount: 100,
      status: 'PENDING',
      payments: [],
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/invoices/inv1']}>
      <Routes>
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('InvoiceDetailPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useInvoice.mockReturnValue({ data: MOCK_INVOICE, isLoading: false });
    useRecordPayment.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
    useDeletePayment.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
    useCancelInvoice.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
    useDownloadSepa.mockReturnValue({ download: vi.fn().mockResolvedValue(undefined), isPending: false, error: null });
    useDownloadPdf.mockReturnValue({ download: vi.fn().mockResolvedValue(undefined), isPending: false });
  });

  // ─── "Registrar pago" button opens the payment form ─────────────────────────

  it('shows "Registrar pago" button for non-paid items', () => {
    renderPage();
    // item1 is PARTIAL → has the button; item2 is PENDING → also has the button
    const buttons = screen.getAllByRole('button', { name: /registrar pago/i });
    expect(buttons).toHaveLength(2);
  });

  it('clicking "Registrar pago" shows payment form with amount and reference inputs', async () => {
    const user = userEvent.setup();
    renderPage();

    const [firstBtn] = screen.getAllByRole('button', { name: /registrar pago/i });
    await user.click(firstBtn);

    expect(screen.getByRole('spinbutton')).toBeInTheDocument(); // type="number"
    expect(screen.getByPlaceholderText(/transferencia|recibo/i)).toBeInTheDocument();
  });

  it('pre-fills amount with remaining balance when payment form opens', async () => {
    const user = userEvent.setup();
    renderPage();

    // item1: amount=100, paid=50 → remaining=50.00
    const [firstBtn] = screen.getAllByRole('button', { name: /registrar pago/i });
    await user.click(firstBtn);

    const amountInput = screen.getByRole('spinbutton');
    expect(amountInput).toHaveValue(50);
  });

  it('user can change amount and reference inputs', async () => {
    const user = userEvent.setup();
    renderPage();

    const [firstBtn] = screen.getAllByRole('button', { name: /registrar pago/i });
    await user.click(firstBtn);

    const amountInput = screen.getByRole('spinbutton');
    await user.clear(amountInput);
    await user.type(amountInput, '25');
    expect(amountInput).toHaveValue(25);

    const refInput = screen.getByPlaceholderText(/transferencia|recibo/i);
    await user.type(refInput, 'TRANS-999');
    expect(refInput).toHaveValue('TRANS-999');
  });

  it('submit payment button calls recordPayment.mutateAsync with correct payload', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useRecordPayment.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    const [firstBtn] = screen.getAllByRole('button', { name: /registrar pago/i });
    await user.click(firstBtn);

    const amountInput = screen.getByRole('spinbutton');
    await user.clear(amountInput);
    await user.type(amountInput, '30');

    const refInput = screen.getByPlaceholderText(/transferencia|recibo/i);
    await user.type(refInput, 'REF-ABC');

    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: 'item1',
          input: expect.objectContaining({ amount: 30, reference: 'REF-ABC' }),
        })
      );
    });
  });

  it('payment form closes after successful submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useRecordPayment.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    const [firstBtn] = screen.getAllByRole('button', { name: /registrar pago/i });
    await user.click(firstBtn);

    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });
  });

  // ─── Cancel payment form ─────────────────────────────────────────────────────

  it('cancel payment form button closes the form without calling mutateAsync', async () => {
    const mutateAsync = vi.fn();
    useRecordPayment.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    const [firstBtn] = screen.getAllByRole('button', { name: /registrar pago/i });
    await user.click(firstBtn);

    expect(screen.getByRole('spinbutton')).toBeInTheDocument();

    // The cancel button inside the payment row — use the one adjacent to "Guardar"
    const cancelBtns = screen.getAllByRole('button', { name: /^cancelar$/i });
    await user.click(cancelBtns[cancelBtns.length - 1]);

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  // ─── Delete payment ✕ button ─────────────────────────────────────────────────

  it('delete payment ✕ button calls deletePayment.mutateAsync after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const mutateAsync = vi.fn().mockResolvedValue({});
    useDeletePayment.mockReturnValue({ mutateAsync });

    const user = userEvent.setup();
    renderPage();

    const deleteBtn = screen.getByRole('button', { name: /eliminar/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('pay1');
    });
  });

  it('delete payment does NOT call mutateAsync when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const mutateAsync = vi.fn();
    useDeletePayment.mockReturnValue({ mutateAsync });

    const user = userEvent.setup();
    renderPage();

    const deleteBtn = screen.getByRole('button', { name: /eliminar/i });
    await user.click(deleteBtn);

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  // ─── Cancel invoice button ───────────────────────────────────────────────────

  it('cancel invoice button calls cancelInvoice.mutateAsync after confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCancelInvoice.mockReturnValue({ mutateAsync });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /cancelar factura/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('inv1');
    });
  });

  it('cancel invoice does NOT call mutateAsync when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const mutateAsync = vi.fn();
    useCancelInvoice.mockReturnValue({ mutateAsync });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /cancelar factura/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('cancel invoice button is not shown when invoice is already CANCELLED', () => {
    useInvoice.mockReturnValue({
      data: { ...MOCK_INVOICE, status: 'CANCELLED' },
      isLoading: false,
    });
    renderPage();
    expect(screen.queryByRole('button', { name: /cancelar factura/i })).not.toBeInTheDocument();
  });

  // ─── Export PDF button ───────────────────────────────────────────────────────

  it('Export PDF button calls pdf.download()', async () => {
    const download = vi.fn().mockResolvedValue(undefined);
    useDownloadPdf.mockReturnValue({ download, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /descargar pdf/i }));

    expect(download).toHaveBeenCalled();
  });

  // ─── SEPA button & modal ─────────────────────────────────────────────────────

  it('SEPA button opens the SEPA modal', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /exportar sepa/i }));

    expect(screen.getByText(/exportar xml sepa/i)).toBeInTheDocument();
  });

  it('SEPA modal contains creditorName, creditorIban, creditorBic inputs', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /exportar sepa/i }));

    expect(screen.getByText(/nombre del acreedor/i)).toBeInTheDocument();
    expect(screen.getByText(/iban del acreedor/i)).toBeInTheDocument();
    expect(screen.getByText(/bic \/ swift/i)).toBeInTheDocument();
  });

  it('user can fill in SEPA form fields', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /exportar sepa/i }));

    const inputs = screen.getAllByRole('textbox');
    // The SEPA modal renders 3 inputs for creditorName, creditorIban, creditorBic
    const sepaInputs = inputs.filter((i) => i.className.includes('input'));
    // Use getAllByRole within the modal — target by order (creditorName first)
    await user.type(sepaInputs[0], 'Comunidad Las Flores');
    await user.type(sepaInputs[1], 'ES9121000418450200051332');
    await user.type(sepaInputs[2], 'CAIXESBBXXX');

    expect(sepaInputs[0]).toHaveValue('Comunidad Las Flores');
    expect(sepaInputs[1]).toHaveValue('ES9121000418450200051332');
    expect(sepaInputs[2]).toHaveValue('CAIXESBBXXX');
  });

  it('SEPA download button is disabled when fields are empty', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /exportar sepa/i }));

    expect(screen.getByRole('button', { name: /descargar xml/i })).toBeDisabled();
  });

  it('SEPA form submit calls sepa.download with the filled form data', async () => {
    const download = vi.fn().mockResolvedValue(undefined);
    useDownloadSepa.mockReturnValue({ download, isPending: false, error: null });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /exportar sepa/i }));

    const inputs = screen.getAllByRole('textbox').filter((i) => i.className.includes('input'));
    await user.type(inputs[0], 'Comunidad Las Flores');
    await user.type(inputs[1], 'ES9121000418450200051332');
    await user.type(inputs[2], 'CAIXESBBXXX');

    await user.click(screen.getByRole('button', { name: /descargar xml/i }));

    await waitFor(() => {
      expect(download).toHaveBeenCalledWith({
        creditorName: 'Comunidad Las Flores',
        creditorIban: 'ES9121000418450200051332',
        creditorBic: 'CAIXESBBXXX',
      });
    });
  });

  it('SEPA modal closes after successful download', async () => {
    const download = vi.fn().mockResolvedValue(undefined);
    useDownloadSepa.mockReturnValue({ download, isPending: false, error: null });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /exportar sepa/i }));

    const inputs = screen.getAllByRole('textbox').filter((i) => i.className.includes('input'));
    await user.type(inputs[0], 'Comunidad');
    await user.type(inputs[1], 'ES12345678901234567890');
    await user.type(inputs[2], 'BICBICXX');

    await user.click(screen.getByRole('button', { name: /descargar xml/i }));

    await waitFor(() => {
      expect(screen.queryByText(/exportar xml sepa/i)).not.toBeInTheDocument();
    });
  });

  it('cancel inside SEPA modal closes the modal without calling download', async () => {
    const download = vi.fn();
    useDownloadSepa.mockReturnValue({ download, isPending: false, error: null });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /exportar sepa/i }));
    expect(screen.getByText(/exportar xml sepa/i)).toBeInTheDocument();

    // The cancel button inside the modal
    const cancelBtns = screen.getAllByRole('button', { name: /^cancelar$/i });
    await user.click(cancelBtns[0]);

    expect(screen.queryByText(/exportar xml sepa/i)).not.toBeInTheDocument();
    expect(download).not.toHaveBeenCalled();
  });

  // ─── Error display ───────────────────────────────────────────────────────────

  it('shows error alert when cancelInvoice.mutateAsync rejects', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'No se puede cancelar' } } },
    });
    useCancelInvoice.mockReturnValue({ mutateAsync });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /cancelar factura/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No se puede cancelar');
    });
  });

  it('shows error alert when recordPayment.mutateAsync rejects', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Pago duplicado' } } },
    });
    useRecordPayment.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    const [firstBtn] = screen.getAllByRole('button', { name: /registrar pago/i });
    await user.click(firstBtn);

    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Pago duplicado');
    });
  });
});
