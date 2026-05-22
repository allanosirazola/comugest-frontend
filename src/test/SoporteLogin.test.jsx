import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { SoporteLoginPage } from '@/pages/SoporteLogin';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => children,
}));

import { useAuth } from '@/contexts/AuthContext';

function renderPage() {
  return render(<MemoryRouter><SoporteLoginPage /></MemoryRouter>);
}

describe('SoporteLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: vi.fn() });
  });

  it('renders the internal panel title', () => {
    renderPage();
    expect(screen.getByText(/panel interno/i)).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderPage();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /entrar al panel/i })).toBeInTheDocument();
  });

  it('shows error when login returns a non-SUPPORT user', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ role: 'ADMIN_FINCAS', firstName: 'Ana' });
    useAuth.mockReturnValue({ login: mockLogin });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/correo electrónico/i), 'admin@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /entrar al panel/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows error on login failure', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('unauthorized'));
    useAuth.mockReturnValue({ login: mockLogin });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/correo electrónico/i), 'soporte@comugest.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /entrar al panel/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('has a back link to the public login', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toBeInTheDocument();
  });
});
