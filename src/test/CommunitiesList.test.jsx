import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n';
import { CommunitiesListPage } from '@/pages/CommunitiesList';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunities: vi.fn(),
}));

import { useCommunities } from '@/hooks/useCommunities';

function renderPage() {
  return render(<MemoryRouter><CommunitiesListPage /></MemoryRouter>);
}

describe('CommunitiesListPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', () => {
    useCommunities.mockReturnValue({ data: undefined, isLoading: true, error: null });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows empty state when no communities', () => {
    useCommunities.mockReturnValue({ data: [], isLoading: false, error: null });
    renderPage();
    expect(screen.getByText(/Crear mi primera comunidad/)).toBeInTheDocument();
  });

  it('renders community cards', () => {
    useCommunities.mockReturnValue({
      data: [
        { id: '1', name: 'Calle Mayor 5', address: 'Calle Mayor 5', postalCode: '28001', city: 'Madrid', cif: null, _count: { units: 10 } },
        { id: '2', name: 'Plaza España 2', address: 'Plaza España 2', postalCode: '28010', city: 'Madrid', cif: 'B12345678', _count: { units: 5 } },
      ],
      isLoading: false,
      error: null,
    });
    renderPage();
    expect(screen.getAllByText('Calle Mayor 5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Plaza España 2').length).toBeGreaterThan(0);
  });

  it('shows CIF when community has one', () => {
    useCommunities.mockReturnValue({
      data: [{ id: '1', name: 'Test', address: 'Test', postalCode: '28001', city: 'Madrid', cif: 'B12345678', _count: { units: 3 } }],
      isLoading: false,
      error: null,
    });
    renderPage();
    expect(screen.getByText(/B12345678/)).toBeInTheDocument();
  });

  it('shows create button', () => {
    useCommunities.mockReturnValue({ data: [], isLoading: false, error: null });
    renderPage();
    expect(screen.getByRole('link', { name: /\+ crear comunidad/i })).toBeInTheDocument();
  });

  it('shows error message on API error', () => {
    useCommunities.mockReturnValue({ data: undefined, isLoading: false, error: new Error('fail') });
    renderPage();
    expect(screen.getByText(/algo ha salido mal/i)).toBeInTheDocument();
  });
});
