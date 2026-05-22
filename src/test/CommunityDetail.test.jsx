import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CommunityDetailPage } from '@/pages/CommunityDetail';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
  useCreateUnit: vi.fn(),
  useDeleteUnit: vi.fn(),
  useDeleteCommunity: vi.fn(),
}));

import { useCommunity, useCreateUnit, useDeleteUnit, useDeleteCommunity } from '@/hooks/useCommunities';

const MOCK_COMMUNITY = {
  id: 'c1',
  name: 'Residencial Olivos',
  address: 'Calle Mayor 5',
  postalCode: '28001',
  city: 'Madrid',
  cif: 'B12345678',
  units: [
    {
      id: 'u1',
      label: '1ºA',
      type: 'VIVIENDA',
      coefficient: '10.50',
      ownerships: [{ owner: { firstName: 'Ana', lastName: 'García' } }],
      occupancies: [],
    },
  ],
  admins: [{ id: 'a1' }],
};

function renderPage(id = 'c1') {
  return render(
    <MemoryRouter initialEntries={[`/communities/${id}`]}>
      <Routes>
        <Route path="/communities/:id" element={<CommunityDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CommunityDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCreateUnit.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useDeleteUnit.mockReturnValue({ mutateAsync: vi.fn() });
    useDeleteCommunity.mockReturnValue({ mutateAsync: vi.fn() });
  });

  it('shows loading state', () => {
    useCommunity.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renders community name and address', () => {
    useCommunity.mockReturnValue({ data: MOCK_COMMUNITY, isLoading: false });
    renderPage();
    expect(screen.getByText('Residencial Olivos')).toBeInTheDocument();
    expect(screen.getByText(/Calle Mayor 5/)).toBeInTheDocument();
  });

  it('renders unit table with unit data', () => {
    useCommunity.mockReturnValue({ data: MOCK_COMMUNITY, isLoading: false });
    renderPage();
    expect(screen.getByText('1ºA')).toBeInTheDocument();
    expect(screen.getByText(/Ana García/)).toBeInTheDocument();
  });

  it('renders quick access links', () => {
    useCommunity.mockReturnValue({ data: MOCK_COMMUNITY, isLoading: false });
    renderPage();
    expect(screen.getByRole('link', { name: /facturas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /gastos/i })).toBeInTheDocument();
  });

  it('shows stat cards', () => {
    useCommunity.mockReturnValue({ data: MOCK_COMMUNITY, isLoading: false });
    renderPage();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });
});
