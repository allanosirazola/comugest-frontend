import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@/i18n';
import { CommunityAnnouncementsPage } from '@/pages/CommunityAnnouncements';

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/StatusBadge', () => ({
  formatDate: (iso) => iso,
  formatMoney: (v) => String(v),
}));

vi.mock('@/hooks/useCommunities', () => ({
  useCommunity: vi.fn(),
}));

vi.mock('@/hooks/useComms', () => ({
  useCommunityAnnouncements: vi.fn(),
  useCreateAnnouncement: vi.fn(),
  useDeleteAnnouncement: vi.fn(),
}));

vi.mock('@/hooks/useTemplates', () => ({
  useTemplates: vi.fn(),
  useCreateTemplate: vi.fn(),
  useDeleteTemplate: vi.fn(),
}));

import { useCommunity } from '@/hooks/useCommunities';
import {
  useCommunityAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from '@/hooks/useComms';
import {
  useTemplates,
  useCreateTemplate,
  useDeleteTemplate,
} from '@/hooks/useTemplates';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communities/c1']}>
      <Routes>
        <Route path="/communities/:id" element={<CommunityAnnouncementsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const defaultCreateAnnouncement = {
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
};
const defaultDeleteAnnouncement = {
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
};
const defaultCreateTemplate = {
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
};
const defaultDeleteTemplate = {
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
};

describe('CommunityAnnouncementsPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useCommunity.mockReturnValue({ data: { id: 'c1', name: 'Test Community' } });
    useCommunityAnnouncements.mockReturnValue({ data: [], isLoading: false });
    useCreateAnnouncement.mockReturnValue({ ...defaultCreateAnnouncement });
    useDeleteAnnouncement.mockReturnValue({ ...defaultDeleteAnnouncement });
    useTemplates.mockReturnValue({ data: [] });
    useCreateTemplate.mockReturnValue({ ...defaultCreateTemplate });
    useDeleteTemplate.mockReturnValue({ ...defaultDeleteTemplate });
  });

  it('renders without the form initially', () => {
    renderPage();
    // Button shows "+ Nuevo anuncio"
    expect(screen.getByRole('button', { name: /nuevo anuncio/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
  });

  it('"+" button toggles the create form on/off', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }));
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();

    // button label now shows "Cancelar"
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
  });

  it('fills form fields and submits, calling createAnnouncement.mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreateAnnouncement.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }));

    await user.type(screen.getByLabelText(/título/i), 'Aviso importante');
    await user.type(screen.getByLabelText(/contenido/i), 'Este es el cuerpo del anuncio');

    // Pinned checkbox - uncheck (default is unchecked, check it)
    const pinnedCheckbox = screen.getByLabelText(/fijar arriba/i);
    await user.click(pinnedCheckbox);
    expect(pinnedCheckbox).toBeChecked();

    // Notify checkbox is checked by default; uncheck it
    const notifyCheckbox = screen.getByLabelText(/notificar por email/i);
    expect(notifyCheckbox).toBeChecked();
    await user.click(notifyCheckbox);
    expect(notifyCheckbox).not.toBeChecked();

    // Expiry date
    const expiresInput = screen.getByLabelText(/fecha de expiración/i);
    await user.type(expiresInput, '2026-12-31');

    // Submit
    await user.click(screen.getByRole('button', { name: /publicar anuncio/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Aviso importante',
          body: 'Este es el cuerpo del anuncio',
          pinned: true,
          notify: false,
        })
      );
    });
  });

  it('shows error alert when createAnnouncement.mutateAsync rejects', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      response: { data: { error: { message: 'Error al publicar' } } },
    });
    useCreateAnnouncement.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }));
    await user.type(screen.getByLabelText(/título/i), 'Título');
    await user.type(screen.getByLabelText(/contenido/i), 'Contenido del anuncio');
    await user.click(screen.getByRole('button', { name: /publicar anuncio/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error al publicar');
    });
  });

  it('"📋 Usar plantilla" button shows the template list', async () => {
    useTemplates.mockReturnValue({
      data: [
        { id: 't1', name: 'Plantilla limpieza', subject: 'Limpieza portal', body: 'Se realizará limpieza' },
      ],
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }));
    // The toolbar button for templates (contains "Usar plantilla")
    const templateBtn = screen.getAllByRole('button', { name: /usar plantilla/i })[0];
    await user.click(templateBtn);

    expect(screen.getByText('Plantilla limpieza')).toBeInTheDocument();
  });

  it('clicking a template in the list applies it to the form', async () => {
    useTemplates.mockReturnValue({
      data: [
        { id: 't1', name: 'Plantilla limpieza', subject: 'Limpieza portal', body: 'Se realizará limpieza este viernes' },
      ],
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }));

    // Open template dropdown
    const toolbarTemplateBtn = screen.getAllByRole('button', { name: /usar plantilla/i })[0];
    await user.click(toolbarTemplateBtn);

    // Click the "Usar plantilla" button inside the dropdown list item
    const applyBtns = screen.getAllByRole('button', { name: /usar plantilla/i });
    // The second one is inside the dropdown list
    await user.click(applyBtns[applyBtns.length - 1]);

    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toHaveValue('Limpieza portal');
      expect(screen.getByLabelText(/contenido/i)).toHaveValue('Se realizará limpieza este viernes');
    });
  });

  it('"Guardar como plantilla" button shows modal with name input, submits createTemplate.mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreateTemplate.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }));

    // Fill title + body so "Guardar como plantilla" appears
    await user.type(screen.getByLabelText(/título/i), 'Mi título');
    await user.type(screen.getByLabelText(/contenido/i), 'Mi contenido largo');

    const saveTemplateBtn = screen.getByRole('button', { name: /guardar como plantilla/i });
    await user.click(saveTemplateBtn);

    // Modal should be visible now with a name input
    const nameInput = screen.getByLabelText(/nombre de la plantilla/i);
    expect(nameInput).toBeInTheDocument();

    await user.type(nameInput, 'Mi plantilla guardada');
    // Submit the modal form via the "Guardar" button inside modal
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Mi plantilla guardada' })
      );
    });
  });

  it('delete announcement button calls deleteAnnouncement.mutateAsync after confirm', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useDeleteAnnouncement.mockReturnValue({ mutateAsync, isPending: false });
    useCommunityAnnouncements.mockReturnValue({
      data: [
        {
          id: 'a1',
          title: 'Anuncio de prueba',
          body: 'Cuerpo del anuncio',
          pinned: false,
          publishedAt: '2026-01-01T10:00:00Z',
          expiresAt: null,
          author: { firstName: 'Ana', lastName: 'García' },
        },
      ],
      isLoading: false,
    });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const user = userEvent.setup();
    renderPage();

    const deleteBtn = screen.getByRole('button', { name: /eliminar/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('a1');
    });
  });

  it('does not delete when user cancels the confirm dialog', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useDeleteAnnouncement.mockReturnValue({ mutateAsync, isPending: false });
    useCommunityAnnouncements.mockReturnValue({
      data: [
        {
          id: 'a1',
          title: 'Anuncio de prueba',
          body: 'Cuerpo',
          pinned: false,
          publishedAt: '2026-01-01T10:00:00Z',
          expiresAt: null,
          author: { firstName: 'Ana', lastName: 'García' },
        },
      ],
      isLoading: false,
    });

    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('cancel button (toggle) hides the form', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo anuncio/i }));
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument();
  });
});
