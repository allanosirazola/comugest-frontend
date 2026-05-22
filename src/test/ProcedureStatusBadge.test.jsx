import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { ProcedureStatusBadge } from '@/components/ProcedureStatusBadge';

// Force Spanish so translations match expected strings
beforeAll(() => i18n.changeLanguage('es'));
afterAll(() => i18n.changeLanguage('es'));

function renderBadge(status) {
  render(
    <I18nextProvider i18n={i18n}>
      <ProcedureStatusBadge status={status} />
    </I18nextProvider>
  );
}

describe('ProcedureStatusBadge', () => {
  it('renders SUBMITTED status', () => {
    renderBadge('SUBMITTED');
    expect(screen.getByText(/presentado/i)).toBeInTheDocument();
  });

  it('renders IN_REVIEW status', () => {
    renderBadge('IN_REVIEW');
    expect(screen.getByText(/en revisión/i)).toBeInTheDocument();
  });

  it('renders IN_PROGRESS status', () => {
    renderBadge('IN_PROGRESS');
    expect(screen.getByText(/en trámite/i)).toBeInTheDocument();
  });

  it('renders COMPLETED status', () => {
    renderBadge('COMPLETED');
    expect(screen.getByText(/resuelto/i)).toBeInTheDocument();
  });

  it('renders REJECTED status', () => {
    renderBadge('REJECTED');
    expect(screen.getByText(/rechazado/i)).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    renderBadge('SUBMITTED');
    const badge = screen.getByText(/presentado/i);
    expect(badge.tagName.toLowerCase()).toBe('span');
  });
});
