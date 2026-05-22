import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { ExpenseBreakdown } from '@/components/ExpenseBreakdown';

// Force Spanish so translations match expected strings
beforeAll(() => i18n.changeLanguage('es'));
afterAll(() => i18n.changeLanguage('es'));

function renderBreakdown(byCategory, total) {
  render(
    <I18nextProvider i18n={i18n}>
      <ExpenseBreakdown byCategory={byCategory} total={total} />
    </I18nextProvider>
  );
}

const sampleCategories = [
  { category: 'CLEANING', total: 500, count: 3, percentage: 50 },
  { category: 'LIFT', total: 300, count: 2, percentage: 30 },
  { category: 'GARBAGE', total: 200, count: 1, percentage: 20 },
];

describe('ExpenseBreakdown', () => {
  it('shows the no-data message when byCategory is empty', () => {
    renderBreakdown([], 0);
    // es locale: "Sin datos para mostrar."
    expect(screen.getByText(/sin datos/i)).toBeInTheDocument();
  });

  it('does not render the legend list when byCategory is empty', () => {
    renderBreakdown([], 0);
    // The <ul> legend only appears when there is data
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders category names in the legend when data is present', () => {
    renderBreakdown(sampleCategories, 1000);
    // es locale: "Limpieza", "Ascensor", "Basuras"
    expect(screen.getByText(/limpieza/i)).toBeInTheDocument();
    expect(screen.getByText(/ascensor/i)).toBeInTheDocument();
    expect(screen.getByText(/basuras/i)).toBeInTheDocument();
  });

  it('renders the total amount formatted as EUR currency', () => {
    renderBreakdown(sampleCategories, 1000);
    // formatMoney(1000) produces something containing "1000" and "€"
    // (jsdom's Intl may omit the thousands separator)
    const totalEl = screen.getByText(/1[.,\s]?000[.,]?\d*\s*€|€\s*1[.,\s]?000/);
    expect(totalEl).toBeInTheDocument();
  });

  it('renders percentage values for each category', () => {
    renderBreakdown(sampleCategories, 1000);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('renders item count for each category', () => {
    renderBreakdown(sampleCategories, 1000);
    expect(screen.getByText('(3)')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();
  });

  it('renders the total label', () => {
    renderBreakdown(sampleCategories, 1000);
    expect(screen.getByText(/total/i)).toBeInTheDocument();
  });
});
