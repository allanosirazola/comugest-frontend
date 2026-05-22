import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { StatusBadge, formatMoney, formatDate } from '@/components/StatusBadge';

// Force Spanish so translations match expected strings
beforeAll(() => i18n.changeLanguage('es'));
afterAll(() => i18n.changeLanguage('es'));

function renderBadge(status) {
  render(
    <I18nextProvider i18n={i18n}>
      <StatusBadge status={status} />
    </I18nextProvider>
  );
}

describe('StatusBadge', () => {
  it('renders the PAID translation key', () => {
    renderBadge('PAID');
    expect(screen.getByText(/pagada/i)).toBeInTheDocument();
  });

  it('renders the PENDING translation key', () => {
    renderBadge('PENDING');
    expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
  });

  it('renders the OVERDUE translation key', () => {
    renderBadge('OVERDUE');
    expect(screen.getByText(/vencida/i)).toBeInTheDocument();
  });

  it('renders the CANCELLED translation key', () => {
    renderBadge('CANCELLED');
    expect(screen.getByText(/cancelada/i)).toBeInTheDocument();
  });

  it('renders the PARTIALLY_PAID translation key', () => {
    renderBadge('PARTIALLY_PAID');
    expect(screen.getByText(/parcial/i)).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    renderBadge('PAID');
    const badge = screen.getByText(/pagada/i);
    expect(badge.tagName.toLowerCase()).toBe('span');
  });
});

describe('formatMoney', () => {
  it('formats a numeric value as EUR currency', () => {
    const result = formatMoney(1234.56, 'en-US');
    expect(result).toMatch(/1[,.]234/);
    expect(result).toMatch(/€|EUR/);
  });

  it('parses a string value correctly', () => {
    const result = formatMoney('99.99', 'en-US');
    expect(result).toMatch(/99/);
    expect(result).toMatch(/€|EUR/);
  });

  it('formats zero as EUR currency', () => {
    const result = formatMoney(0, 'en-US');
    expect(result).toMatch(/0/);
    expect(result).toMatch(/€|EUR/);
  });

  it('uses es-ES locale by default and formats correctly', () => {
    const result = formatMoney(500);
    expect(result).toMatch(/500/);
    expect(result).toMatch(/€/);
  });
});

describe('formatDate', () => {
  it('formats an ISO date string into a readable date', () => {
    const result = formatDate('2025-06-15', 'en-US');
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/Jun|6/);
    expect(result).toMatch(/15/);
  });

  it('uses the es-ES locale by default', () => {
    const result = formatDate('2025-01-20');
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/20/);
  });

  it('formats a date at the end of the year', () => {
    const result = formatDate('2024-12-31', 'en-US');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/Dec|12/);
    expect(result).toMatch(/31/);
  });
});
