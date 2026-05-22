import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Start and end in Spanish to avoid affecting other test files
beforeAll(() => i18n.changeLanguage('es'));
afterAll(() => i18n.changeLanguage('es'));

function renderSwitcher() {
  render(
    <I18nextProvider i18n={i18n}>
      <LanguageSwitcher />
    </I18nextProvider>
  );
}

describe('LanguageSwitcher', () => {
  it('renders both ES and EN buttons', () => {
    renderSwitcher();
    expect(screen.getByRole('button', { name: /^es$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^en$/i })).toBeInTheDocument();
  });

  it('marks the current language button as aria-pressed=true when set to es', () => {
    i18n.changeLanguage('es');
    renderSwitcher();
    const esBtn = screen.getByRole('button', { name: /^es$/i });
    const enBtn = screen.getByRole('button', { name: /^en$/i });
    expect(esBtn).toHaveAttribute('aria-pressed', 'true');
    expect(enBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('marks EN as aria-pressed=true and ES as false when language is en', () => {
    i18n.changeLanguage('en');
    renderSwitcher();
    const esBtn = screen.getByRole('button', { name: /^es$/i });
    const enBtn = screen.getByRole('button', { name: /^en$/i });
    expect(enBtn).toHaveAttribute('aria-pressed', 'true');
    expect(esBtn).toHaveAttribute('aria-pressed', 'false');
    i18n.changeLanguage('es');
  });

  it('changes i18n language to en when EN button is clicked', () => {
    i18n.changeLanguage('es');
    renderSwitcher();
    fireEvent.click(screen.getByRole('button', { name: /^en$/i }));
    expect(i18n.resolvedLanguage).toBe('en');
    i18n.changeLanguage('es');
  });

  it('changes i18n language back to es when ES button is clicked', () => {
    i18n.changeLanguage('en');
    renderSwitcher();
    fireEvent.click(screen.getByRole('button', { name: /^es$/i }));
    expect(i18n.resolvedLanguage).toBe('es');
  });
});
