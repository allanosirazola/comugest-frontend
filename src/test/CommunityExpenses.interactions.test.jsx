import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CommunityExpensesPage } from '@/pages/CommunityExpenses';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatMoney: (v) => `${v} €`,
  formatDate: (d) => d,
}));

vi.mock('@/components/ExpenseBreakdown', () => ({
  ExpenseBreakdown: () => <div data-testid="expense-breakdown" />,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

vi.mock('@/hooks/useExpenses', () => ({
  useCommunityExpenses: vi.fn(),
  useCreateExpense: vi.fn(),
  useDeleteExpense: vi.fn(),
}));

// EXPENSE_CATEGORIES is a plain array — no need to mock the api/expenses module

import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityExpenses, useCreateExpense, useDeleteExpense } from '@/hooks/useExpenses';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communities/c1']}>
      <Routes>
        <Route path="/communities/:id" element={<CommunityExpensesPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const emptyData = { expenses: [], summary: { byCategory: [], total: 0 } };

describe('CommunityExpensesPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useCommunity.mockReturnValue({ data: { id: 'c1', name: 'Comunidad Test' } });
    useCommunityExpenses.mockReturnValue({ data: emptyData, isLoading: false });
    useCreateExpense.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false });
    useDeleteExpense.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
  });

  it('renders page with "Registrar gasto" toggle button', () => {
    renderPage();
    // es: expenses.create → "Registrar gasto"
    expect(screen.getByRole('button', { name: /registrar gasto/i })).toBeInTheDocument();
  });

  it('"Registrar gasto" button toggles the create form on/off', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /registrar gasto/i }));

    // es: expenses.concept → "Concepto"
    expect(screen.getByLabelText(/concepto/i)).toBeInTheDocument();
    // es: expenses.amount → "Importe"
    expect(screen.getByLabelText(/importe/i)).toBeInTheDocument();

    // es: common.cancel → "Cancelar"
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByLabelText(/concepto/i)).not.toBeInTheDocument();
  });

  it('fills all form fields and submits, calling createExpense.mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreateExpense.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /registrar gasto/i }));

    // es: expenses.categoryLabel → "Categoría"
    // select category (id="category") — CLEANING is default, pick LIFT
    await user.selectOptions(document.getElementById('category'), 'LIFT');

    // es: expenses.amount → "Importe" (id="amount")
    await user.type(document.getElementById('amount'), '350.50');

    // es: expenses.concept → "Concepto" (id="concept")
    await user.type(document.getElementById('concept'), 'Revisión ascensor');

    // es: expenses.date → "Fecha" (id="expenseDate") — clear first since it has a default value
    const dateInput = document.getElementById('expenseDate');
    await user.clear(dateInput);
    await user.type(dateInput, '2026-03-15');

    // es: expenses.supplier → "Proveedor" (id="supplier")
    await user.type(document.getElementById('supplier'), 'Ascensores SA');

    // es: expenses.attachmentUrl → "URL de la factura (opcional)" (id="attachmentUrl")
    await user.type(document.getElementById('attachmentUrl'), 'https://example.com/factura.pdf');

    // es: expenses.save → "Guardar gasto"
    await user.click(screen.getByRole('button', { name: /guardar gasto/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'LIFT',
          concept: 'Revisión ascensor',
          supplier: 'Ascensores SA',
          attachmentUrl: 'https://example.com/factura.pdf',
        })
      );
    });
  });

  it('shows error alert when createExpense.mutateAsync rejects', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Importe no válido' } } },
    });
    useCreateExpense.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /registrar gasto/i }));
    await user.type(document.getElementById('concept'), 'Fallo');
    await user.type(document.getElementById('amount'), '0');
    await user.click(screen.getByRole('button', { name: /guardar gasto/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Importe no válido');
    });
  });

  it('cancel button hides the creation form', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /registrar gasto/i }));
    expect(screen.getByLabelText(/concepto/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByLabelText(/concepto/i)).not.toBeInTheDocument();
  });

  it('category filter dropdown changes the filter value passed to useCommunityExpenses', async () => {
    // The filter select is always visible (outside the form)
    const user = userEvent.setup();
    renderPage();

    // Select "CLEANING" from the filter dropdown
    // es: expenses.allCategories → "Todas las categorías" (default option)
    const filterSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(filterSelect, 'CLEANING');

    // useCommunityExpenses is called again with the new filter — verify via spy
    await waitFor(() => {
      expect(useCommunityExpenses).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({ category: 'CLEANING' })
      );
    });
  });

  it('delete "✕" button calls deleteExpense.mutateAsync after confirm', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useDeleteExpense.mockReturnValue({ mutateAsync });
    useCommunityExpenses.mockReturnValue({
      data: {
        expenses: [
          {
            id: 'exp1',
            concept: 'Limpieza portal',
            category: 'CLEANING',
            amount: '120.00',
            expenseDate: '2026-02-01',
            supplier: null,
          },
        ],
        summary: { byCategory: [{ category: 'CLEANING', total: 120 }], total: 120 },
      },
      isLoading: false,
    });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const user = userEvent.setup();
    renderPage();

    // The delete button in the table row renders "✕"
    const deleteBtn = screen.getByRole('button', { name: /✕/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('exp1');
    });
  });

  it('does not delete when user cancels the confirm dialog', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useDeleteExpense.mockReturnValue({ mutateAsync });
    useCommunityExpenses.mockReturnValue({
      data: {
        expenses: [
          {
            id: 'exp1',
            concept: 'Limpieza portal',
            category: 'CLEANING',
            amount: '120.00',
            expenseDate: '2026-02-01',
            supplier: null,
          },
        ],
        summary: { byCategory: [], total: 120 },
      },
      isLoading: false,
    });

    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /✕/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
