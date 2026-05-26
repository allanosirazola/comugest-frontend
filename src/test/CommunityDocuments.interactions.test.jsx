import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@/i18n';
import { CommunityDocumentsPage } from '@/pages/CommunityDocuments';

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

vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: vi.fn(),
  useCreateDocument: vi.fn(),
  useDeleteDocument: vi.fn(),
}));

import { useDocuments, useCreateDocument, useDeleteDocument } from '@/hooks/useDocuments';

const MOCK_DOCUMENT = {
  id: 'd1',
  name: 'Acta reunión 2024',
  url: 'https://drive.google.com/doc1',
  description: 'Acta de la junta ordinaria',
  category: 'ACTA',
  publicForResidents: true,
  createdAt: '2024-01-15T10:00:00Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communities/c1/documents']}>
      <Routes>
        <Route path="/communities/:id/documents" element={<CommunityDocumentsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function setupDefaultMocks({
  docs = [],
  createMutateAsync = vi.fn().mockResolvedValue({}),
  deleteMutateAsync = vi.fn().mockResolvedValue({}),
} = {}) {
  useDocuments.mockReturnValue({ data: docs, isLoading: false });
  useCreateDocument.mockReturnValue({ mutateAsync: createMutateAsync, isPending: false });
  useDeleteDocument.mockReturnValue({ mutateAsync: deleteMutateAsync, isPending: false });
}

describe('CommunityDocumentsPage interactions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title and "Añadir documento" button', () => {
    setupDefaultMocks();
    renderPage();
    expect(screen.getByText(/documentos de la comunidad/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /añadir documento/i })).toBeInTheDocument();
  });

  it('"Añadir documento" button toggles the creation form open', async () => {
    setupDefaultMocks();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir documento/i }));

    expect(screen.getByPlaceholderText(/nombre del documento/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/url del documento/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/descripción/i)).toBeInTheDocument();
    // category select should be present
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    // publicForResidents checkbox
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('"Cancelar" button hides the form after it is opened', async () => {
    setupDefaultMocks();
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir documento/i }));
    expect(screen.getByPlaceholderText(/nombre del documento/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByPlaceholderText(/nombre del documento/i)).not.toBeInTheDocument();
  });

  it('fills form and calls createDocument.mutateAsync on submit', async () => {
    const createMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ createMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir documento/i }));

    await user.type(screen.getByPlaceholderText(/nombre del documento/i), 'Reglamento interno');
    await user.type(
      screen.getByPlaceholderText(/url del documento/i),
      'https://drive.google.com/reglamento'
    );
    await user.type(screen.getByPlaceholderText(/descripción/i), 'Normativa de la comunidad');
    await user.selectOptions(screen.getByRole('combobox'), 'REGLAMENTO');

    // The submit button inside the form shares the same text as the toggle button but
    // the toggle button text has changed to "Cancelar" at this point, so only one
    // "Añadir documento" button (the submit) should be visible.
    const submitBtn = screen.getByRole('button', { name: /añadir documento/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Reglamento interno',
          url: 'https://drive.google.com/reglamento',
          description: 'Normativa de la comunidad',
          category: 'REGLAMENTO',
          publicForResidents: true,
        })
      );
    });
  });

  it('publicForResidents checkbox can be unchecked', async () => {
    const createMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ createMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir documento/i }));

    // Uncheck the "Visible para vecinos" checkbox (checked by default)
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    await user.type(screen.getByPlaceholderText(/nombre del documento/i), 'Doc privado');
    await user.type(
      screen.getByPlaceholderText(/url del documento/i),
      'https://drive.google.com/privado'
    );

    await user.click(screen.getByRole('button', { name: /añadir documento/i }));

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ publicForResidents: false })
      );
    });
  });

  it('shows error alert when createDocument.mutateAsync rejects', async () => {
    const createMutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'URL no válida' } } },
    });
    setupDefaultMocks({ createMutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /añadir documento/i }));
    await user.type(screen.getByPlaceholderText(/nombre del documento/i), 'Doc X');
    await user.type(
      screen.getByPlaceholderText(/url del documento/i),
      'https://drive.google.com/x'
    );

    await user.click(screen.getByRole('button', { name: /añadir documento/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('URL no válida');
    });
  });

  it('delete button (aria-label=Eliminar) calls deleteDocument.mutateAsync after confirm', async () => {
    const deleteMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ docs: [MOCK_DOCUMENT], deleteMutateAsync });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderPage();

    const deleteBtn = screen.getByRole('button', { name: /eliminar/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledWith('d1');
    });
  });

  it('does not call deleteDocument.mutateAsync when confirm returns false', async () => {
    const deleteMutateAsync = vi.fn().mockResolvedValue({});
    setupDefaultMocks({ docs: [MOCK_DOCUMENT], deleteMutateAsync });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(deleteMutateAsync).not.toHaveBeenCalled();
  });

  it('shows empty state when there are no documents', () => {
    setupDefaultMocks({ docs: [] });
    renderPage();
    expect(screen.getByText(/no hay documentos disponibles/i)).toBeInTheDocument();
  });

  it('renders document when docs exist', () => {
    setupDefaultMocks({ docs: [MOCK_DOCUMENT] });
    renderPage();
    expect(screen.getByText('Acta reunión 2024')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    useDocuments.mockReturnValue({ data: [], isLoading: true });
    useCreateDocument.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useDeleteDocument.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
