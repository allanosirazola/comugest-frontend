import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

// Prevent AuthProvider from making real API calls during bootstrap
vi.mock('@/api/auth', () => ({
  getMe: vi.fn().mockResolvedValue(null),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}));

vi.mock('@/api/client', () => ({
  tokenStorage: {
    getAccess: vi.fn().mockReturnValue(null),
    getRefresh: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    clear: vi.fn(),
  },
  api: { interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}));

// NotificationBell calls useNotifications (useQuery) — mock it to avoid QueryClient requirement
vi.mock('@/components/NotificationBell', () => ({
  NotificationBell: () => null,
}));

import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';

// Force Spanish for all layout tests
beforeAll(() => i18n.changeLanguage('es'));
afterAll(() => i18n.changeLanguage('es'));

function renderLayout(children = <div>page content</div>) {
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </MemoryRouter>
    </I18nextProvider>
  );
}

describe('Layout', () => {
  it('renders the app name in the header', async () => {
    renderLayout();
    expect(await screen.findByText('Comugest')).toBeInTheDocument();
  });

  it('renders the Messages nav link', async () => {
    renderLayout();
    // es locale: nav.messages = "Mensajes"
    expect(await screen.findByRole('link', { name: /mensajes/i })).toBeInTheDocument();
  });

  it('renders the "Más" dropdown button (which contains Report link)', async () => {
    renderLayout();
    // The "Reportar" link is inside the "Más" dropdown; test that the trigger exists
    // and that clicking it reveals the link
    const masBtn = await screen.findByRole('button', { name: /más/i });
    expect(masBtn).toBeInTheDocument();
    fireEvent.click(masBtn);
    expect(await screen.findByRole('link', { name: /reportar/i })).toBeInTheDocument();
  });

  it('renders the user menu button (which contains logout)', async () => {
    renderLayout();
    // The "Cerrar sesión" button is inside the user menu dropdown; test the trigger
    const userMenuBtn = await screen.findByRole('button', { name: /user menu/i });
    expect(userMenuBtn).toBeInTheDocument();
    fireEvent.click(userMenuBtn);
    expect(await screen.findByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('renders the language switcher with ES and EN buttons', async () => {
    renderLayout();
    expect(await screen.findByRole('button', { name: /^es$/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /^en$/i })).toBeInTheDocument();
  });

  it('renders children inside the main area', async () => {
    renderLayout(<span>hello world</span>);
    expect(await screen.findByText('hello world')).toBeInTheDocument();
  });

  it('renders resident nav link "Mis facturas" for non-admin users', async () => {
    renderLayout();
    // "Mis facturas" is in the desktop nav bar (always rendered in DOM)
    expect(await screen.findByRole('link', { name: /mis facturas/i })).toBeInTheDocument();
  });
});
