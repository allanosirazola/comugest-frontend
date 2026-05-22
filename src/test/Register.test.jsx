import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { RegisterPage } from '@/pages/Register';

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

function renderWithRouter(ui, { initialEntries = ['/register'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
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

  it('renders all required form fields', () => {
    renderWithRouter(<RegisterPage />);

    // es: "Nombre", "Apellidos", "Correo electrónico", "Contraseña", "Crear cuenta"
    expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^apellidos$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('shows admin-only badge and note', () => {
    renderWithRouter(<RegisterPage />);

    expect(screen.getByText(/administrador de fincas/i)).toBeInTheDocument();
    expect(screen.getByText(/registro es exclusivo para administradores/i)).toBeInTheDocument();
  });

  it('renders the GDPR checkbox and a sign-in link', () => {
    renderWithRouter(<RegisterPage />);

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    // es: "Inicia sesión"
    expect(screen.getByRole('link', { name: /inicia sesión/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitted with empty required fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      // errors.required es: "Este campo es obligatorio"
      const errors = screen.getAllByText(/este campo es obligatorio/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('calls register() and passes the correct payload on valid submission', async () => {
    const mockRegister = vi.fn().mockResolvedValue({ email: 'new@example.com' });
    useAuth.mockReturnValue({
      login: vi.fn(),
      register: mockRegister,
      applyAuthResponse: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    const user = userEvent.setup();
    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByLabelText(/^nombre$/i), 'Ana');
    await user.type(screen.getByLabelText(/^apellidos$/i), 'García');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'new@example.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'SecurePass1');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          firstName: 'Ana',
          lastName: 'García',
          password: 'SecurePass1',
          gdprAccepted: true,
        })
      );
    });
  });

  it('shows server error alert when register() rejects', async () => {
    const apiError = { response: { data: { error: { message: 'Email ya registrado' } } } };
    const mockRegister = vi.fn().mockRejectedValue(apiError);
    useAuth.mockReturnValue({
      login: vi.fn(),
      register: mockRegister,
      applyAuthResponse: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    const user = userEvent.setup();
    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByLabelText(/^nombre$/i), 'Ana');
    await user.type(screen.getByLabelText(/^apellidos$/i), 'García');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), 'SecurePass1');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email ya registrado');
    });
  });
});
