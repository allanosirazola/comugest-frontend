import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { MyExpensesPage } from '@/pages/MyExpenses';

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
  useMyCommunities: vi.fn(),
}));

vi.mock('@/hooks/useExpenses', () => ({
  useMyExpenses: vi.fn(),
}));

import { useMyCommunities } from '@/hooks/useCommunities';
import { useMyExpenses } from '@/hooks/useExpenses';

function renderPage() {
  return render(<MemoryRouter><MyExpensesPage /></MemoryRouter>);
}

describe('MyExpensesPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows not-in-community message when user has no communities', () => {
    useMyCommunities.mockReturnValue({ data: [] });
    useMyExpenses.mockReturnValue({ data: undefined, isLoading: false });
    renderPage();
    expect(screen.getByText(/no perteneces a ninguna comunidad/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    useMyCommunities.mockReturnValue({ data: [{ id: 'c1', name: 'Com' }] });
    useMyExpenses.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renders expense breakdown and list', () => {
    useMyCommunities.mockReturnValue({ data: [{ id: 'c1', name: 'Comunidad Norte' }] });
    useMyExpenses.mockReturnValue({
      data: {
        expenses: [{
          id: 'e1',
          concept: 'Limpieza escalera',
          category: 'CLEANING',
          amount: '120.00',
          expenseDate: '2024-03-15',
        }],
        summary: { byCategory: [], total: 120 },
      },
      isLoading: false,
    });
    renderPage();
    expect(screen.getByText('Limpieza escalera')).toBeInTheDocument();
    expect(screen.getByTestId('breakdown')).toBeInTheDocument();
  });

  it('shows community selector when user belongs to multiple communities', () => {
    useMyCommunities.mockReturnValue({
      data: [
        { id: 'c1', name: 'Comunidad Norte' },
        { id: 'c2', name: 'Comunidad Sur' },
      ],
    });
    useMyExpenses.mockReturnValue({ data: undefined, isLoading: false });
    renderPage();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
