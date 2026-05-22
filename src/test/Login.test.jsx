import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/Login';
import '@/i18n';

function renderLogin() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  it('renderiza email y password', () => {
    renderLogin();
    expect(screen.getByLabelText(/correo|email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña|password/i)).toBeInTheDocument();
  });

  it('muestra enlace a registro', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /crear|create/i })).toBeInTheDocument();
  });
});
