import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { TicketStatusBadge, TicketPriorityBadge } from '@/components/TicketBadges';

// Force Spanish so translations match expected strings
beforeAll(() => i18n.changeLanguage('es'));
afterAll(() => i18n.changeLanguage('es'));

function renderStatusBadge(status) {
  render(
    <I18nextProvider i18n={i18n}>
      <TicketStatusBadge status={status} />
    </I18nextProvider>
  );
}

function renderPriorityBadge(priority) {
  render(
    <I18nextProvider i18n={i18n}>
      <TicketPriorityBadge priority={priority} />
    </I18nextProvider>
  );
}

describe('TicketStatusBadge', () => {
  it('renders OPEN status in Spanish', () => {
    renderStatusBadge('OPEN');
    expect(screen.getByText(/abierto/i)).toBeInTheDocument();
  });

  it('renders IN_PROGRESS status', () => {
    renderStatusBadge('IN_PROGRESS');
    expect(screen.getByText(/en curso/i)).toBeInTheDocument();
  });

  it('renders RESOLVED status', () => {
    renderStatusBadge('RESOLVED');
    expect(screen.getByText(/resuelto/i)).toBeInTheDocument();
  });

  it('renders CLOSED status', () => {
    renderStatusBadge('CLOSED');
    expect(screen.getByText(/cerrado/i)).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    renderStatusBadge('OPEN');
    const badge = screen.getByText(/abierto/i);
    expect(badge.tagName.toLowerCase()).toBe('span');
  });
});

describe('TicketPriorityBadge', () => {
  it('renders LOW priority', () => {
    renderPriorityBadge('LOW');
    expect(screen.getByText(/baja/i)).toBeInTheDocument();
  });

  it('renders MEDIUM priority', () => {
    renderPriorityBadge('MEDIUM');
    expect(screen.getByText(/media/i)).toBeInTheDocument();
  });

  it('renders HIGH priority', () => {
    renderPriorityBadge('HIGH');
    expect(screen.getByText(/alta/i)).toBeInTheDocument();
  });

  it('renders URGENT priority', () => {
    renderPriorityBadge('URGENT');
    expect(screen.getByText(/urgente/i)).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    renderPriorityBadge('HIGH');
    const badge = screen.getByText(/alta/i);
    expect(badge.tagName.toLowerCase()).toBe('span');
  });
});
