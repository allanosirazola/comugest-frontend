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
  ExpenseBreakdown: () => <div data-testid="breakdown" />,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

vi.mock('@/hooks/useExpenses', () => ({
  useCommunityExpenses: vi.fn(),
  useCreateExpense: vi.fn(),
  useDeleteExpense: vi.fn(),
}));

import { useCommunity } from '@/hooks/useCommunities';
import { useCommunityExpenses, useCreateExpense, useDeleteExpense } from '@/hooks/useExpenses';

function renderPage(id = 'comm-1') {
  return render(
    <MemoryRouter initialEntries={[`/communities/${id}/expenses`]}>
      <Routes>
        <Route path="/communities/:id/expenses" element={<CommunityExpensesPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CommunityExpensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCommunity.mockReturnValue({ data: { name: 'Comunidad Test' } });
    useCreateExpense.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useDeleteExpense.mockReturnValue({ mutateAsync: vi.fn() });
  });

  it('shows loading state', () => {
    useCommunityExpenses.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty state', () => {
    useCommunityExpenses.mockReturnValue({ data: { expenses: [], summary: { byCategory: [], total: 0 } }, isLoading: false });
    renderPage();
    expect(screen.getByText(/no hay gastos/i)).toBeInTheDocument();
  });

  it('renders expenses table', () => {
    useCommunityExpenses.mockReturnValue({
      data: {
        expenses: [{ id: 'e1', concept: 'Reparación ascensor', category: 'REPAIRS', amount: '800.00', expenseDate: '2024-02-10', supplier: 'Ascensores SA' }],
        summary: { byCategory: [], total: 800 },
      },
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('Reparación ascensor')).toBeInTheDocument();
    expect(screen.getByText('Ascensores SA')).toBeInTheDocument();
  });

  it('opens form when create button is clicked', async () => {
    useCommunityExpenses.mockReturnValue({ data: { expenses: [], summary: { byCategory: [], total: 0 } }, isLoading: false });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /registrar gasto/i }));

    expect(screen.getByLabelText(/concepto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/importe/i)).toBeInTheDocument();
  });

  it('calls mutateAsync on valid form submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreateExpense.mockReturnValue({ mutateAsync, isPending: false });
    useCommunityExpenses.mockReturnValue({ data: { expenses: [], summary: { byCategory: [], total: 0 } }, isLoading: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /registrar gasto/i }));
    await user.type(screen.getByLabelText(/concepto/i), 'Pintura portal');
    await user.type(screen.getByLabelText(/importe/i), '350');
    await user.click(screen.getByRole('button', { name: /^guardar gasto$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ concept: 'Pintura portal' }));
    });
  });
});
