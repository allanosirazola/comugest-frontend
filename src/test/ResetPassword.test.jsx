import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { ResetPasswordPage } from '@/pages/ResetPassword';

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

function renderWithRouter(ui, { initialEntries = ['/reset-password?token=abc123'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the new-password field and submit button', () => {
    renderWithRouter(<ResetPasswordPage />);

    // es: "Nueva contraseña", "Cambiar contraseña"
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  it('calls resetPassword() with the token and new password on submit', async () => {
    authApi.resetPassword.mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithRouter(<ResetPasswordPage />, {
      initialEntries: ['/reset-password?token=my-reset-token'],
    });

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'NewSecure1');
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(authApi.resetPassword).toHaveBeenCalledWith('my-reset-token', 'NewSecure1');
    });
  });

  it('shows the success message after the password is reset', async () => {
    authApi.resetPassword.mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithRouter(<ResetPasswordPage />);

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'NewSecure1');
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      // successTitle es: "Contraseña actualizada"
      expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
    });

    // The form should no longer be visible
    expect(screen.queryByRole('button', { name: /cambiar contraseña/i })).not.toBeInTheDocument();
  });

  it('shows an error alert when resetPassword() rejects', async () => {
    const apiError = { response: { data: { error: { message: 'Token expirado' } } } };
    authApi.resetPassword.mockRejectedValue(apiError);

    const user = userEvent.setup();
    renderWithRouter(<ResetPasswordPage />);

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'NewSecure1');
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Token expirado');
    });
  });

  it('shows missing-token error when no ?token param is present', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ResetPasswordPage />, {
      initialEntries: ['/reset-password'],
    });

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'NewSecure1');
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      // missingToken es: "Falta el token en el enlace."
      expect(screen.getByRole('alert')).toHaveTextContent(/falta el token/i);
    });

    // resetPassword API must NOT have been called
    expect(authApi.resetPassword).not.toHaveBeenCalled();
  });
});
