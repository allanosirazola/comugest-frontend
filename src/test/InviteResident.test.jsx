import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { InviteResidentPage } from '@/pages/InviteResident';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/api/invitations', () => ({
  createInvitation: vi.fn(),
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunities: vi.fn(),
  useUnits: vi.fn(),
}));

import * as invitationsApi from '@/api/invitations';
import { useCommunities, useUnits } from '@/hooks/useCommunities';

function renderPage() {
  return render(<MemoryRouter><InviteResidentPage /></MemoryRouter>);
}

describe('InviteResidentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUnits.mockReturnValue({ data: [], isLoading: false });
  });

  it('shows message when no communities exist', () => {
    useCommunities.mockReturnValue({ data: [], isLoading: false });
    renderPage();
    expect(screen.getByText(/antes de invitar/i)).toBeInTheDocument();
  });

  it('renders form when communities exist', () => {
    useCommunities.mockReturnValue({ data: [{ id: 'c1', name: 'Com Test', city: 'Madrid' }], isLoading: false });
    renderPage();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  });

  it('shows success feedback after invite', async () => {
    useCommunities.mockReturnValue({ data: [{ id: 'c1', name: 'Com Test', city: 'Madrid' }], isLoading: false });
    useUnits.mockReturnValue({
      data: [{ id: 'u1', label: '3ºB', type: 'VIVIENDA', occupancies: [] }],
      isLoading: false,
    });
    invitationsApi.createInvitation.mockResolvedValue({ sentTo: 'vecino@test.com' });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/^apellidos/i), 'López');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'vecino@test.com');

    const communitySelect = screen.getByLabelText(/comunidad/i);
    await user.selectOptions(communitySelect, 'c1');

    await waitFor(() => {
      expect(screen.getByLabelText(/^unidad$/i)).not.toBeDisabled();
    });

    const unitSelect = screen.getByLabelText(/^unidad$/i);
    await user.selectOptions(unitSelect, 'u1');

    await user.click(screen.getByRole('button', { name: /enviar invitación/i }));

    await waitFor(() => {
      expect(invitationsApi.createInvitation).toHaveBeenCalled();
    });
  });

  it('shows error feedback on failure', async () => {
    useCommunities.mockReturnValue({ data: [{ id: 'c1', name: 'Com Test', city: 'Madrid' }], isLoading: false });
    useUnits.mockReturnValue({ data: [{ id: 'u1', label: '3ºB', type: 'VIVIENDA', occupancies: [] }], isLoading: false });
    invitationsApi.createInvitation.mockRejectedValue({
      response: { data: { error: { message: 'Email ya registrado' } } },
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^nombre/i), 'Juan');
    await user.type(screen.getByLabelText(/^apellidos/i), 'López');
    await user.type(screen.getByLabelText(/correo electrónico/i), 'ya@registrado.com');

    const communitySelect = screen.getByLabelText(/comunidad/i);
    await user.selectOptions(communitySelect, 'c1');

    await waitFor(() => expect(screen.getByLabelText(/^unidad$/i)).not.toBeDisabled());
    await user.selectOptions(screen.getByLabelText(/^unidad$/i), 'u1');
    await user.click(screen.getByRole('button', { name: /enviar invitación/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email ya registrado');
    });
  });
});
