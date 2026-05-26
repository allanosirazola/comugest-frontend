import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { ProfilePage } from '@/pages/ProfilePage';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'u1', role: 'ADMIN_FINCAS' },
  }),
}));

vi.mock('@/hooks/useMe', () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
  useChangePassword: vi.fn(),
  useSetup2FA: vi.fn(),
  useVerify2FA: vi.fn(),
  useDisable2FA: vi.fn(),
}));

vi.mock('@/hooks/usePush', () => ({
  usePushNotifications: vi.fn().mockReturnValue({
    supported: false,
    subscribed: false,
    loading: false,
    error: null,
    enable: vi.fn(),
    disable: vi.fn(),
  }),
}));

import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useSetup2FA,
  useVerify2FA,
  useDisable2FA,
} from '@/hooks/useMe';

const MOCK_PROFILE = {
  firstName: 'Juan',
  lastName: 'García',
  phone: '600111222',
  locale: 'es',
  totpEnabled: false,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  );
}

function setupDefaultMocks({
  profile = MOCK_PROFILE,
  updateMutateAsync = vi.fn().mockResolvedValue({}),
  changePasswordMutateAsync = vi.fn().mockResolvedValue({}),
  setup2FAMutateAsync = vi.fn().mockResolvedValue({ qrCode: 'data:image/png;base64,abc', secret: 'TOTP_SECRET' }),
  verify2FAMutateAsync = vi.fn().mockResolvedValue({}),
  disable2FAMutateAsync = vi.fn().mockResolvedValue({}),
} = {}) {
  useProfile.mockReturnValue({ data: profile, isLoading: false });
  useUpdateProfile.mockReturnValue({ mutateAsync: updateMutateAsync, isPending: false, error: null });
  useChangePassword.mockReturnValue({ mutateAsync: changePasswordMutateAsync, isPending: false, error: null });
  useSetup2FA.mockReturnValue({ mutateAsync: setup2FAMutateAsync, isPending: false });
  useVerify2FA.mockReturnValue({ mutateAsync: verify2FAMutateAsync, isPending: false });
  useDisable2FA.mockReturnValue({ mutateAsync: disable2FAMutateAsync, isPending: false });
}

describe('ProfilePage interactions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders personal data section with name, last name, phone, and locale inputs', () => {
    setupDefaultMocks();
    const { container } = renderPage();

    // Labels exist as visible text (inputs lack htmlFor so use container queries by name attr)
    expect(screen.getByText(/^nombre$/i)).toBeInTheDocument();
    expect(screen.getByText(/^apellidos$/i)).toBeInTheDocument();
    expect(screen.getByText(/^teléfono$/i)).toBeInTheDocument();
    expect(screen.getByText(/^idioma$/i)).toBeInTheDocument();
    expect(container.querySelector('[name="firstName"]')).toBeInTheDocument();
    expect(container.querySelector('[name="lastName"]')).toBeInTheDocument();
    expect(container.querySelector('[name="phone"]')).toBeInTheDocument();
    expect(container.querySelector('[name="locale"]')).toBeInTheDocument();
  });

  it('personal data inputs are pre-filled with profile data', () => {
    setupDefaultMocks();
    renderPage();

    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('García')).toBeInTheDocument();
    expect(screen.getByDisplayValue('600111222')).toBeInTheDocument();
  });

  it('"Guardar cambios" calls updateProfile.mutateAsync with form data', async () => {
    const updateMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ updateMutateAsync });
    const user = userEvent.setup();
    const { container } = renderPage();

    const firstNameInput = container.querySelector('[name="firstName"]');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Carlos');

    const lastNameInput = container.querySelector('[name="lastName"]');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'López');

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Carlos',
          lastName: 'López',
          locale: 'es',
        })
      );
    });
  });

  it('shows "Cambios guardados" feedback after successful profile update', async () => {
    const updateMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ updateMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/cambios guardados/i)).toBeInTheDocument();
    });
  });

  it('language select can be changed', async () => {
    const updateMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ updateMutateAsync });
    const user = userEvent.setup();
    const { container } = renderPage();

    const localeSelect = container.querySelector('[name="locale"]');
    await user.selectOptions(localeSelect, 'en');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'en' })
      );
    });
  });

  it('renders change password section with current and new password inputs', () => {
    setupDefaultMocks();
    const { container } = renderPage();

    expect(container.querySelector('[name="currentPassword"]')).toBeInTheDocument();
    expect(container.querySelector('[name="newPassword"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeInTheDocument();
  });

  it('"Cambiar contraseña" calls changePassword.mutateAsync with credentials', async () => {
    const changePasswordMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ changePasswordMutateAsync });
    const user = userEvent.setup();
    const { container } = renderPage();

    await user.type(container.querySelector('[name="currentPassword"]'), 'OldPass123');
    await user.type(container.querySelector('[name="newPassword"]'), 'NewPass456');

    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(changePasswordMutateAsync).toHaveBeenCalledWith({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
      });
    });
  });

  it('shows "Contraseña actualizada correctamente" on successful password change', async () => {
    const changePasswordMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ changePasswordMutateAsync });
    const user = userEvent.setup();
    const { container } = renderPage();

    await user.type(container.querySelector('[name="currentPassword"]'), 'OldPass123');
    await user.type(container.querySelector('[name="newPassword"]'), 'NewPass456');
    await user.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText(/contraseña actualizada correctamente/i)).toBeInTheDocument();
    });
  });

  it('shows error when changePassword.mutateAsync has error on the hook', async () => {
    const changePasswordMutateAsync = vi.fn().mockRejectedValue(new Error('wrong password'));
    useProfile.mockReturnValue({ data: MOCK_PROFILE, isLoading: false });
    useUpdateProfile.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null });
    useChangePassword.mockReturnValue({
      mutateAsync: changePasswordMutateAsync,
      isPending: false,
      error: { response: { data: { message: 'Contraseña actual incorrecta' } } },
    });
    useSetup2FA.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useVerify2FA.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useDisable2FA.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/contraseña actual incorrecta/i)).toBeInTheDocument();
    });
  });

  it('renders 2FA section with "Activar 2FA" button when 2FA is disabled', () => {
    setupDefaultMocks({ profile: { ...MOCK_PROFILE, totpEnabled: false } });
    renderPage();

    expect(screen.getByRole('button', { name: /activar 2fa/i })).toBeInTheDocument();
    expect(screen.getByText(/2fa desactivado/i)).toBeInTheDocument();
  });

  it('"Activar 2FA" button calls setup2FA.mutateAsync and shows QR code step', async () => {
    const setup2FAMutateAsync = vi.fn().mockResolvedValue({
      qrCode: 'data:image/png;base64,abc123',
      secret: 'ABCDEF123456',
    });
    setupDefaultMocks({ setup2FAMutateAsync, profile: { ...MOCK_PROFILE, totpEnabled: false } });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /activar 2fa/i }));

    await waitFor(() => {
      expect(setup2FAMutateAsync).toHaveBeenCalled();
      expect(screen.getByAltText(/QR 2FA/i)).toBeInTheDocument();
      expect(screen.getByText('ABCDEF123456')).toBeInTheDocument();
    });
  });

  it('2FA verification code input and confirm calls verify2FA.mutateAsync', async () => {
    const setup2FAMutateAsync = vi.fn().mockResolvedValue({
      qrCode: 'data:image/png;base64,abc123',
      secret: 'ABCDEF123456',
    });
    const verify2FAMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({
      setup2FAMutateAsync,
      verify2FAMutateAsync,
      profile: { ...MOCK_PROFILE, totpEnabled: false },
    });
    const user = userEvent.setup();
    renderPage();

    // Open setup flow
    await user.click(screen.getByRole('button', { name: /activar 2fa/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/código de 6 dígitos/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/código de 6 dígitos/i), '123456');
    await user.click(screen.getByRole('button', { name: /confirmar y activar/i }));

    await waitFor(() => {
      expect(verify2FAMutateAsync).toHaveBeenCalledWith('123456');
    });
  });

  it('shows 2FA verify error when verify2FA.mutateAsync rejects', async () => {
    const setup2FAMutateAsync = vi.fn().mockResolvedValue({
      qrCode: 'data:image/png;base64,abc123',
      secret: 'ABCDEF123456',
    });
    const verify2FAMutateAsync = vi.fn().mockRejectedValue(new Error('Invalid token'));
    setupDefaultMocks({
      setup2FAMutateAsync,
      verify2FAMutateAsync,
      profile: { ...MOCK_PROFILE, totpEnabled: false },
    });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /activar 2fa/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/código de 6 dígitos/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/código de 6 dígitos/i), '000000');
    await user.click(screen.getByRole('button', { name: /confirmar y activar/i }));

    await waitFor(() => {
      expect(screen.getByText(/código incorrecto/i)).toBeInTheDocument();
    });
  });

  it('renders "Desactivar 2FA" button when 2FA is enabled', () => {
    setupDefaultMocks({ profile: { ...MOCK_PROFILE, totpEnabled: true } });
    renderPage();

    expect(screen.getByRole('button', { name: /desactivar 2fa/i })).toBeInTheDocument();
    expect(screen.getByText(/2fa activado/i)).toBeInTheDocument();
  });

  it('"Desactivar 2FA" shows token input and calls disable2FA.mutateAsync', async () => {
    const disable2FAMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({
      disable2FAMutateAsync,
      profile: { ...MOCK_PROFILE, totpEnabled: true },
    });
    const user = userEvent.setup();
    renderPage();

    // Click "Desactivar 2FA" to enter disable flow
    await user.click(screen.getByRole('button', { name: /desactivar 2fa/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/código de 6 dígitos/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/código de 6 dígitos/i), '654321');

    // The disable submit button has text from twofa.disableBtn ("Desactivar 2FA")
    const disableBtns = screen.getAllByRole('button', { name: /desactivar 2fa/i });
    const submitBtn = disableBtns.find((b) => b.type === 'submit');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(disable2FAMutateAsync).toHaveBeenCalledWith('654321');
    });
  });

  it('shows loading state while profile is fetching', () => {
    useProfile.mockReturnValue({ data: null, isLoading: true });
    useUpdateProfile.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null });
    useChangePassword.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null });
    useSetup2FA.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useVerify2FA.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useDisable2FA.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    renderPage();

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
