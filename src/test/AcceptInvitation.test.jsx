import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { AcceptInvitationPage } from '@/pages/AcceptInvitation';

vi.mock('@/api/invitations', () => ({
  inspectInvitation: vi.fn(),
  acceptInvitation: vi.fn(),
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

import * as invitationsApi from '@/api/invitations';
import { useAuth } from '@/contexts/AuthContext';

const MOCK_INFO = {
  firstName: 'Carlos',
  email: 'carlos@example.com',
  communityName: 'Las Flores',
};

function renderWithRouter(ui, { initialEntries = ['/accept-invitation?token=test-token'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

describe('AcceptInvitationPage', () => {
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

  it('shows a loading indicator on mount while the invitation is being fetched', () => {
    // inspectInvitation never resolves during this test
    invitationsApi.inspectInvitation.mockReturnValue(new Promise(() => {}));

    renderWithRouter(<AcceptInvitationPage />);

    // es: "Cargando…"
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('calls inspectInvitation() with the token from the URL on mount', async () => {
    invitationsApi.inspectInvitation.mockResolvedValue(MOCK_INFO);

    renderWithRouter(<AcceptInvitationPage />, {
      initialEntries: ['/accept-invitation?token=my-invite-token'],
    });

    await waitFor(() => {
      expect(invitationsApi.inspectInvitation).toHaveBeenCalledWith('my-invite-token');
    });
  });

  it('renders the invitation form with recipient name and email once info loads', async () => {
    invitationsApi.inspectInvitation.mockResolvedValue(MOCK_INFO);

    renderWithRouter(<AcceptInvitationPage />);

    await waitFor(() => {
      // title es: "Hola, {{name}}" → "Hola, Carlos"
      expect(screen.getByText(/hola, carlos/i)).toBeInTheDocument();
    });

    // The invitee's email is shown read-only in the form
    expect(screen.getByText('carlos@example.com')).toBeInTheDocument();
    // es: "Elige una contraseña", "Activar mi cuenta"
    expect(screen.getByLabelText(/elige una contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /activar mi cuenta/i })).toBeInTheDocument();
  });

  it('shows an error card when inspectInvitation() rejects', async () => {
    const apiError = { response: { data: { error: { message: 'Invitación caducada' } } } };
    invitationsApi.inspectInvitation.mockRejectedValue(apiError);

    renderWithRouter(<AcceptInvitationPage />);

    await waitFor(() => {
      // errorTitle es: "Invitación no válida"
      expect(screen.getByText(/invitación no válida/i)).toBeInTheDocument();
      expect(screen.getByText('Invitación caducada')).toBeInTheDocument();
    });
  });

  it('shows an error immediately when no ?token is present in the URL', async () => {
    renderWithRouter(<AcceptInvitationPage />, {
      initialEntries: ['/accept-invitation'],
    });

    await waitFor(() => {
      expect(screen.getByText(/invitación no válida/i)).toBeInTheDocument();
      // missingToken es: "Este enlace no contiene un token válido."
      expect(screen.getByText(/este enlace no contiene un token válido/i)).toBeInTheDocument();
    });

    expect(invitationsApi.inspectInvitation).not.toHaveBeenCalled();
  });

  it('calls acceptInvitation() and applyAuthResponse on valid form submission', async () => {
    const mockApply = vi.fn();
    useAuth.mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
      applyAuthResponse: mockApply,
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    invitationsApi.inspectInvitation.mockResolvedValue(MOCK_INFO);
    invitationsApi.acceptInvitation.mockResolvedValue({
      accessToken: 'tok',
      refreshToken: 'ref',
      user: { id: '42' },
    });

    const user = userEvent.setup();
    renderWithRouter(<AcceptInvitationPage />);

    // Wait for the form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/elige una contraseña/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/elige una contraseña/i), 'SecurePass1!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /activar mi cuenta/i }));

    await waitFor(() => {
      expect(invitationsApi.acceptInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'test-token',
          password: 'SecurePass1!',
          gdprAccepted: true,
        })
      );
    });

    expect(mockApply).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'tok' })
    );
  });
});
