import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@/i18n';
import { CommunitySuppliersPage } from '@/pages/CommunitySuppliers';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'u1', role: 'ADMIN_FINCAS' },
  }),
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn().mockReturnValue({ data: { id: 'c1', name: 'Test Community' } }),
}));

vi.mock('@/hooks/useSuppliers', () => ({
  useSuppliers: vi.fn(),
  useCreateSupplier: vi.fn(),
  useUpdateSupplier: vi.fn(),
  useDeleteSupplier: vi.fn(),
}));

import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/useSuppliers';

const MOCK_SUPPLIER = {
  id: 's1',
  name: 'Proveedor Test',
  cif: 'B12345678',
  email: 'proveedor@test.com',
  phone: '600123456',
  address: 'Calle Test 1',
  notes: 'Notas de prueba',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communities/c1/suppliers']}>
      <Routes>
        <Route path="/communities/:id/suppliers" element={<CommunitySuppliersPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function setupDefaultMocks({ suppliers = [], createMutateAsync = vi.fn().mockResolvedValue({}), updateMutateAsync = vi.fn().mockResolvedValue({}), deleteMutateAsync = vi.fn().mockResolvedValue({}) } = {}) {
  useSuppliers.mockReturnValue({ data: suppliers, isLoading: false });
  useCreateSupplier.mockReturnValue({ mutateAsync: createMutateAsync, isPending: false });
  useUpdateSupplier.mockReturnValue({ mutateAsync: updateMutateAsync, isPending: false });
  useDeleteSupplier.mockReturnValue({ mutateAsync: deleteMutateAsync, isPending: false });
}

describe('CommunitySuppliersPage interactions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title and "Añadir proveedor" button', () => {
    setupDefaultMocks();
    renderPage();
    expect(screen.getByText(/añadir proveedor/i)).toBeInTheDocument();
  });

  it('"Añadir proveedor" button toggles the creation form open', async () => {
    setupDefaultMocks();
    const user = userEvent.setup();
    renderPage();

    const addBtn = screen.getByRole('button', { name: /añadir proveedor/i });
    await user.click(addBtn);

    expect(screen.getByPlaceholderText(/nombre del proveedor/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/CIF \/ NIF/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/notas internas/i)).toBeInTheDocument();
  });

  it('cancel button hides the form', async () => {
    setupDefaultMocks();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir proveedor/i }));
    expect(screen.getByPlaceholderText(/nombre del proveedor/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByPlaceholderText(/nombre del proveedor/i)).not.toBeInTheDocument();
  });

  it('fills form fields and calls createSupplier.mutateAsync on submit', async () => {
    const createMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ createMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir proveedor/i }));

    await user.type(screen.getByPlaceholderText(/nombre del proveedor/i), 'Nuevo Proveedor');
    await user.type(screen.getByPlaceholderText(/CIF \/ NIF/i), 'A11111111');
    await user.type(screen.getByPlaceholderText(/email/i), 'nuevo@prov.com');
    await user.type(screen.getByPlaceholderText(/teléfono/i), '611222333');
    await user.type(screen.getByPlaceholderText(/dirección/i), 'Av. Nueva 10');
    await user.type(screen.getByPlaceholderText(/notas internas/i), 'Una nota');

    // The submit button text is the translation of suppliers.addSupplier ("Añadir proveedor")
    const submitBtns = screen.getAllByRole('button', { name: /añadir proveedor/i });
    // The form submit button is inside the form (not the toggle button which is now "Cancelar")
    const submitBtn = submitBtns.find((b) => b.type === 'submit');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        name: 'Nuevo Proveedor',
        cif: 'A11111111',
        email: 'nuevo@prov.com',
        phone: '611222333',
        address: 'Av. Nueva 10',
        notes: 'Una nota',
      });
    });
  });

  it('shows error alert when createSupplier.mutateAsync rejects', async () => {
    const createMutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'CIF duplicado' } } },
    });
    setupDefaultMocks({ createMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir proveedor/i }));
    await user.type(screen.getByPlaceholderText(/nombre del proveedor/i), 'Proveedor X');

    const submitBtn = screen.getAllByRole('button', { name: /añadir proveedor/i }).find((b) => b.type === 'submit');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('CIF duplicado');
    });
  });

  it('"Editar" button opens form pre-filled with supplier data', async () => {
    setupDefaultMocks({ suppliers: [MOCK_SUPPLIER] });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /editar/i }));

    expect(screen.getByDisplayValue('Proveedor Test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('B12345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('proveedor@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('600123456')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Calle Test 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Notas de prueba')).toBeInTheDocument();
  });

  it('submit in edit mode calls updateSupplier.mutateAsync', async () => {
    const updateMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ suppliers: [MOCK_SUPPLIER], updateMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /editar/i }));

    // Clear and re-type name to change it
    const nameInput = screen.getByDisplayValue('Proveedor Test');
    await user.clear(nameInput);
    await user.type(nameInput, 'Proveedor Editado');

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ id: 's1', name: 'Proveedor Editado' })
      );
    });
  });

  it('"✕" delete button calls deleteSupplier.mutateAsync after confirm', async () => {
    const deleteMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ suppliers: [MOCK_SUPPLIER], deleteMutateAsync });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '✕' }));

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledWith('s1');
    });
  });

  it('does not call deleteSupplier.mutateAsync when confirm is cancelled', async () => {
    const deleteMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ suppliers: [MOCK_SUPPLIER], deleteMutateAsync });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '✕' }));

    expect(deleteMutateAsync).not.toHaveBeenCalled();
  });

  it('shows empty state when there are no suppliers', () => {
    setupDefaultMocks({ suppliers: [] });
    renderPage();
    expect(screen.getByText(/no hay proveedores registrados/i)).toBeInTheDocument();
  });

  it('shows supplier list when suppliers exist', () => {
    setupDefaultMocks({ suppliers: [MOCK_SUPPLIER] });
    renderPage();
    expect(screen.getByText('Proveedor Test')).toBeInTheDocument();
    expect(screen.getByText('proveedor@test.com')).toBeInTheDocument();
  });
});
