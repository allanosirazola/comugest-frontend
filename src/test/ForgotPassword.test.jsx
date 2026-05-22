import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { ForgotPasswordPage } from '@/pages/ForgotPassword';

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

function renderWithRouter(ui, { initialEntries = ['/forgot-password'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email field, submit button, and a link back to login', () => {
    renderWithRouter(<ForgotPasswordPage />);

    // es: "Correo electrónico", "Enviar enlace", "Volver al inicio de sesión"
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio de sesión/i })).toBeInTheDocument();
  });

  it('calls forgotPassword() with the trimmed, lower-cased email on submit', async () => {
    authApi.forgotPassword.mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText(/correo electrónico/i), '  User@Example.COM  ');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(authApi.forgotPassword).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('shows the email-sent success message after a successful submission', async () => {
    authApi.forgotPassword.mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      // sentTitle es: "Revisa tu correo"
      expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument();
    });

    // The form should no longer be visible
    expect(screen.queryByRole('button', { name: /enviar enlace/i })).not.toBeInTheDocument();
  });

  it('does not show the success state before forgotPassword() resolves', async () => {
    // Arrange: keep the API call pending indefinitely
    authApi.forgotPassword.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    // While the request is in-flight the form should still be visible
    // (button becomes "Cargando…" and is disabled, success heading is absent)
    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled();
    // sentTitle es: "Revisa tu correo" — must NOT appear yet
    expect(screen.queryByRole('heading', { name: /revisa tu correo/i })).not.toBeInTheDocument();
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolveApi;
    authApi.forgotPassword.mockReturnValue(new Promise((res) => { resolveApi = res; }));

    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    // While in flight the button text changes to "Cargando…" and is disabled
    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled();

    resolveApi(undefined);
  });
});
