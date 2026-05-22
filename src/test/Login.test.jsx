import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { LoginPage } from '@/pages/Login';

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

import { useAuth } from '@/contexts/AuthContext';

function renderWithRouter(ui, { initialEntries = ['/login'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
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

  it('renders email, password fields and submit button', () => {
    renderWithRouter(<LoginPage />);

    // es: "Correo electrónico", "Contraseña", "Iniciar sesión"
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('renders links to register and forgot-password', () => {
    renderWithRouter(<LoginPage />);

    // es: "Crear una cuenta", "¿Has olvidado tu contraseña?"
    expect(screen.getByRole('link', { name: /crear una cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /olvidado.*contraseña/i })).toBeInTheDocument();
  });

  it('shows email validation error when submitted with empty fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      // errors.invalidEmail es: "Correo no válido"
      expect(screen.getByText(/correo no válido/i)).toBeInTheDocument();
    });
  });

  it('calls login() with email and password on valid submission', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    useAuth.mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      applyAuthResponse: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'MyPassword1');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'MyPassword1',
      });
    });
  });

  it('shows server error alert when login() rejects', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    useAuth.mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      applyAuthResponse: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      // errorInvalid es: "Email o contraseña incorrectos"
      expect(screen.getByRole('alert')).toHaveTextContent(/email o contraseña incorrectos/i);
    });
  });

  it('disables submit button while the login request is in flight', async () => {
    let resolveLogin;
    const mockLogin = vi.fn().mockReturnValue(new Promise((res) => { resolveLogin = res; }));
    useAuth.mockReturnValue({
      login: mockLogin,
      register: vi.fn(),
      applyAuthResponse: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@example.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'MyPassword1');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // While the promise is still pending the button shows "Cargando…" and is disabled
    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled();

    resolveLogin(undefined);
  });
});
