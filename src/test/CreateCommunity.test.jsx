import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { CreateCommunityPage } from '@/pages/CreateCommunity';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCreateCommunity: vi.fn(),
}));

import { useCreateCommunity } from '@/hooks/useCommunities';

function renderPage() {
  return render(<MemoryRouter><CreateCommunityPage /></MemoryRouter>);
}

describe('CreateCommunityPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders form fields', () => {
    useCreateCommunity.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    renderPage();
    expect(screen.getByLabelText(/nombre de la comunidad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument();
  });

  it('renders units table with one default row', () => {
    useCreateCommunity.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    renderPage();
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
  });

  it('adds a new unit row when add button is clicked', async () => {
    useCreateCommunity.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    const user = userEvent.setup();
    renderPage();

    const initialRows = screen.getAllByRole('row').length;
    await user.click(screen.getByRole('button', { name: /\+ añadir unidad/i }));
    expect(screen.getAllByRole('row').length).toBeGreaterThan(initialRows);
  });

  it('calls mutateAsync on valid form submission', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 'comm-1' });
    useCreateCommunity.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nombre de la comunidad/i), 'Comunidad Los Olivos');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle Mayor 1');
    await user.type(screen.getByLabelText(/código postal/i), '28001');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.click(screen.getByRole('button', { name: /crear comunidad/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Comunidad Los Olivos',
        address: 'Calle Mayor 1',
      }));
    });
  });

  it('shows loading state while submitting', () => {
    useCreateCommunity.mockReturnValue({ mutateAsync: vi.fn(), isPending: true });
    renderPage();
    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled();
  });
});
