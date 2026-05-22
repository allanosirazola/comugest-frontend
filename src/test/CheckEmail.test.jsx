import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { CheckEmailPage } from '@/pages/CheckEmail';

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  resendVerification: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => null,
}));

import * as authApi from '@/api/auth';

function renderWithRouter(ui, { initialEntries = ['/check-email?email=test@example.com'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

describe('CheckEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title and displays the email from the query param', () => {
    renderWithRouter(<CheckEmailPage />);

    // title es: "Revisa tu correo"
    expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders a resend button and a back-to-login link', () => {
    renderWithRouter(<CheckEmailPage />);

    // es: "Reenviar el correo", "Volver al inicio de sesión"
    expect(screen.getByRole('button', { name: /reenviar el correo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio de sesión/i })).toBeInTheDocument();
  });

  it('calls resendVerification() with the email when the resend button is clicked', async () => {
    authApi.resendVerification.mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithRouter(<CheckEmailPage />);

    await user.click(screen.getByRole('button', { name: /reenviar el correo/i }));

    await waitFor(() => {
      expect(authApi.resendVerification).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows a confirmation message after resend and replaces the button', async () => {
    authApi.resendVerification.mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithRouter(<CheckEmailPage />);

    await user.click(screen.getByRole('button', { name: /reenviar el correo/i }));

    await waitFor(() => {
      // resent es: "Correo reenviado correctamente."
      expect(screen.getByText(/correo reenviado correctamente/i)).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /reenviar el correo/i })).not.toBeInTheDocument();
  });

  it('disables the resend button when no email query param is present', () => {
    renderWithRouter(<CheckEmailPage />, { initialEntries: ['/check-email'] });

    expect(screen.getByRole('button', { name: /reenviar el correo/i })).toBeDisabled();
  });
});
