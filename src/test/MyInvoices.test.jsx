import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { MyInvoicesPage } from '@/pages/MyInvoices';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }) => <span>{status}</span>,
  formatMoney: (v) => `${v} €`,
  formatDate: (d) => d,
}));

vi.mock('@/hooks/useInvoices', () => ({
  useMyInvoiceItems: vi.fn(),
}));

import { useMyInvoiceItems } from '@/hooks/useInvoices';

function renderPage() {
  return render(<MemoryRouter><MyInvoicesPage /></MemoryRouter>);
}

describe('MyInvoicesPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    useMyInvoiceItems.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    useMyInvoiceItems.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/no tienes facturas/i)).toBeInTheDocument();
  });

  it('renders invoice items', () => {
    useMyInvoiceItems.mockReturnValue({
      data: [{
        id: '1',
        amount: '150.00',
        status: 'PENDING',
        consumptionValue: null,
        consumptionUnit: null,
        payments: [],
        invoice: {
          concept: 'Cuota octubre',
          dueDate: '2024-10-31',
          community: { name: 'Comunidad Test' },
          attachmentUrl: null,
        },
        unit: { label: '3ºB' },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('Cuota octubre')).toBeInTheDocument();
    expect(screen.getByText(/Comunidad Test/)).toBeInTheDocument();
    expect(screen.getByText(/3ºB/)).toBeInTheDocument();
  });

  it('shows total pending banner when there are pending amounts', () => {
    useMyInvoiceItems.mockReturnValue({
      data: [{
        id: '1',
        amount: '200.00',
        status: 'PENDING',
        consumptionValue: null,
        consumptionUnit: null,
        payments: [],
        invoice: {
          concept: 'Cuota',
          dueDate: '2024-10-31',
          community: { name: 'Com' },
          attachmentUrl: null,
        },
        unit: { label: '1A' },
      }],
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText(/total pendiente/i)).toBeInTheDocument();
  });
});
