import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { VerifyEmailPage } from '@/pages/VerifyEmail';

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  resendVerification: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    login: vi.fn(),
    register: vi.fn(),
    applyAuthResponse: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
    user: null,
  }),
  AuthProvider: ({ children }) => children,
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => null,
}));

import * as authApi from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';

function renderWithRouter(ui, { initialEntries = ['/verify-email?token=abc123'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
      applyAuthResponse: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });
  });

  it('shows the verifying/loading state before the API resolves', () => {
    // verifyEmail never resolves during this test
    authApi.verifyEmail.mockReturnValue(new Promise(() => {}));

    renderWithRouter(<VerifyEmailPage />);

    // verifying es: "Verificando tu correo…"
    expect(screen.getByText(/verificando tu correo/i)).toBeInTheDocument();
  });

  it('calls verifyEmail() with the token extracted from the URL', async () => {
    authApi.verifyEmail.mockResolvedValue({
      accessToken: 'tok',
      refreshToken: 'ref',
      user: { id: '1' },
    });

    renderWithRouter(<VerifyEmailPage />, {
      initialEntries: ['/verify-email?token=my-verify-token'],
    });

    await waitFor(() => {
      expect(authApi.verifyEmail).toHaveBeenCalledWith('my-verify-token');
    });
  });

  it('shows the success message and calls applyAuthResponse after verification', async () => {
    const mockApply = vi.fn();
    useAuth.mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
      applyAuthResponse: mockApply,
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    authApi.verifyEmail.mockResolvedValue({
      accessToken: 'tok',
      refreshToken: 'ref',
      user: { id: '1' },
    });

    renderWithRouter(<VerifyEmailPage />);

    await waitFor(() => {
      // successTitle es: "¡Listo! Tu correo está verificado"
      expect(screen.getByText(/tu correo está verificado/i)).toBeInTheDocument();
    });

    expect(mockApply).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'tok' })
    );
  });

  it('shows the error title and API message when verifyEmail() rejects', async () => {
    const apiError = { response: { data: { error: { message: 'Token inválido o caducado' } } } };
    authApi.verifyEmail.mockRejectedValue(apiError);

    renderWithRouter(<VerifyEmailPage />);

    await waitFor(() => {
      // errorTitle es: "No hemos podido verificarlo"
      expect(screen.getByText(/no hemos podido verificarlo/i)).toBeInTheDocument();
      expect(screen.getByText('Token inválido o caducado')).toBeInTheDocument();
    });
  });

  it('shows an error immediately and does not call the API when no ?token is in the URL', async () => {
    renderWithRouter(<VerifyEmailPage />, { initialEntries: ['/verify-email'] });

    await waitFor(() => {
      expect(screen.getByText(/no hemos podido verificarlo/i)).toBeInTheDocument();
      // missingToken es: "Falta el token en el enlace"
      expect(screen.getByText(/falta el token/i)).toBeInTheDocument();
    });

    expect(authApi.verifyEmail).not.toHaveBeenCalled();
  });
});
