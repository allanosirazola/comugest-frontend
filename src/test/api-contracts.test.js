/**
 * Frontend API contract tests.
 *
 * These tests verify that each API function:
 * 1. Calls the CORRECT URL (catches path bugs like wrong nesting)
 * 2. Extracts the CORRECT field from the response shape
 * 3. Handles errors gracefully (propagates them)
 *
 * Uses axios-mock-adapter to intercept HTTP calls without a real server.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { api } from '../api/client';

// Create a mock adapter that intercepts all requests on the `api` axios instance
let mock;
beforeEach(() => {
  mock = new MockAdapter(api);
});
afterEach(() => {
  mock.restore();
});

// ============================================================================
// api/templates.js
// ============================================================================

describe('api/templates.js', () => {
  it('listTemplates: calls correct URL /communities/:id/templates', async () => {
    const { listTemplates } = await import('../api/templates.js');

    mock.onGet('/communities/comm-1/templates').reply(200, {
      templates: [
        { id: 'tpl-1', name: 'Welcome', subject: 'Hi', body: 'Hello' },
        { id: 'tpl-2', name: 'Payment', subject: 'Pay up', body: 'Please pay' },
      ],
    });

    const result = await listTemplates('comm-1');

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('name', 'Welcome');
  });

  it('listTemplates: extracts data.templates (NOT bare data)', async () => {
    const { listTemplates } = await import('../api/templates.js');

    mock.onGet('/communities/comm-1/templates').reply(200, {
      templates: [{ id: 'tpl-1', name: 'Test Template' }],
    });

    const result = await listTemplates('comm-1');

    // Must be an array (from data.templates), NOT the full response object
    expect(Array.isArray(result)).toBe(true);
    expect(result).not.toHaveProperty('templates');
  });

  it('listTemplates: returns empty array when server returns empty templates', async () => {
    const { listTemplates } = await import('../api/templates.js');

    mock.onGet('/communities/comm-1/templates').reply(200, { templates: [] });

    const result = await listTemplates('comm-1');
    expect(result).toEqual([]);
  });

  it('listTemplates: falls back to [] when templates field is missing', async () => {
    const { listTemplates } = await import('../api/templates.js');

    mock.onGet('/communities/comm-1/templates').reply(200, {});

    const result = await listTemplates('comm-1');
    expect(result).toEqual([]);
  });

  it('createTemplate: calls correct URL and sends data', async () => {
    const { createTemplate } = await import('../api/templates.js');

    mock.onPost('/communities/comm-1/templates').reply(201, {
      template: { id: 'tpl-new', name: 'New Template' },
    });

    const result = await createTemplate('comm-1', {
      name: 'New Template',
      subject: 'Reminder',
      body: 'Please check...',
    });

    expect(result).toHaveProperty('template');
    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe('/communities/comm-1/templates');
  });

  it('deleteTemplate: calls correct URL', async () => {
    const { deleteTemplate } = await import('../api/templates.js');

    mock.onDelete('/communities/comm-1/templates/tpl-1').reply(204);

    await deleteTemplate('comm-1', 'tpl-1');

    expect(mock.history.delete).toHaveLength(1);
    expect(mock.history.delete[0].url).toBe('/communities/comm-1/templates/tpl-1');
  });
});

// ============================================================================
// api/areas.js
// ============================================================================

describe('api/areas.js', () => {
  it('createReservation: calls CORRECT nested URL /communities/:communityId/areas/:areaId/reservations', async () => {
    const { createReservation } = await import('../api/areas.js');

    mock
      .onPost('/communities/comm-1/areas/area-1/reservations')
      .reply(201, { reservation: { id: 'res-1' } });

    const result = await createReservation('comm-1', 'area-1', {
      startAt: '2025-07-01T10:00:00Z',
      endAt: '2025-07-01T12:00:00Z',
    });

    expect(result).toHaveProperty('id', 'res-1');
    expect(mock.history.post).toHaveLength(1);
    // The URL MUST include /communities/:communityId/ prefix
    expect(mock.history.post[0].url).toBe('/communities/comm-1/areas/area-1/reservations');
    // Must NOT call the wrong flat URL /areas/:id/reservations
    expect(mock.history.post[0].url).not.toBe('/areas/area-1/reservations');
  });

  it('listReservations: calls correct nested URL', async () => {
    const { listReservations } = await import('../api/areas.js');

    mock
      .onGet('/communities/comm-1/areas/area-1/reservations')
      .reply(200, { reservations: [] });

    await listReservations('comm-1', 'area-1');

    expect(mock.history.get[0].url).toBe('/communities/comm-1/areas/area-1/reservations');
  });

  it('listAreas: calls correct URL', async () => {
    const { listAreas } = await import('../api/areas.js');

    mock.onGet('/communities/comm-1/areas').reply(200, { areas: [] });

    await listAreas('comm-1');

    expect(mock.history.get[0].url).toBe('/communities/comm-1/areas');
  });

  it('updateArea: calls flat /areas/:id URL (correct for updates)', async () => {
    const { updateArea } = await import('../api/areas.js');

    mock.onPatch('/areas/area-1').reply(200, { area: { id: 'area-1', name: 'Updated' } });

    const result = await updateArea('area-1', { name: 'Updated' });

    expect(result).toHaveProperty('id', 'area-1');
    expect(mock.history.patch[0].url).toBe('/areas/area-1');
  });

  it('cancelReservation: calls flat /areas/reservations/:id URL', async () => {
    const { cancelReservation } = await import('../api/areas.js');

    mock.onDelete('/areas/reservations/res-1').reply(204);

    await cancelReservation('res-1');

    expect(mock.history.delete[0].url).toBe('/areas/reservations/res-1');
  });
});

// ============================================================================
// api/expenses.js
// ============================================================================

describe('api/expenses.js', () => {
  it('listCommunityExpenses: returns full data object (expenses + summary)', async () => {
    const { listCommunityExpenses } = await import('../api/expenses.js');

    mock.onGet('/communities/comm-1/expenses').reply(200, {
      expenses: [{ id: 'exp-1', amount: 100, category: 'CLEANING' }],
      summary: { total: 100, byCategory: { CLEANING: 100 } },
    });

    const result = await listCommunityExpenses('comm-1');

    // Must return { expenses, summary } object — not just the expenses array
    expect(result).toHaveProperty('expenses');
    expect(result).toHaveProperty('summary');
    expect(Array.isArray(result.expenses)).toBe(true);
  });

  it('listCommunityExpenses: calls correct URL with filter params', async () => {
    const { listCommunityExpenses } = await import('../api/expenses.js');

    mock.onGet('/communities/comm-1/expenses').reply(200, { expenses: [], summary: {} });

    await listCommunityExpenses('comm-1', { category: 'CLEANING' });

    expect(mock.history.get[0].url).toBe('/communities/comm-1/expenses');
  });

  it('createExpense: calls correct URL and returns expense', async () => {
    const { createExpense } = await import('../api/expenses.js');

    mock.onPost('/communities/comm-1/expenses').reply(201, {
      expense: { id: 'exp-new', amount: 250, category: 'LIFT' },
    });

    const result = await createExpense('comm-1', { amount: 250, category: 'LIFT' });

    expect(result).toHaveProperty('id', 'exp-new');
    expect(mock.history.post[0].url).toBe('/communities/comm-1/expenses');
  });

  it('deleteExpense: calls flat /expenses/:id URL', async () => {
    const { deleteExpense } = await import('../api/expenses.js');

    mock.onDelete('/expenses/exp-1').reply(204);

    await deleteExpense('exp-1');

    expect(mock.history.delete[0].url).toBe('/expenses/exp-1');
  });
});

// ============================================================================
// api/invoices.js
// ============================================================================

describe('api/invoices.js', () => {
  it('downloadInvoicePdf: calls correct nested URL /communities/:communityId/invoices/:invoiceId/pdf', async () => {
    const { exportPdf } = await import('../api/invoices.js');

    const fakeBuffer = new ArrayBuffer(8);
    mock
      .onGet('/communities/comm-1/invoices/inv-1/pdf')
      .reply(200, fakeBuffer);

    await exportPdf('comm-1', 'inv-1');

    expect(mock.history.get).toHaveLength(1);
    expect(mock.history.get[0].url).toBe('/communities/comm-1/invoices/inv-1/pdf');
    // Must use arraybuffer responseType
    expect(mock.history.get[0].responseType).toBe('arraybuffer');
  });

  it('listCommunityInvoices: extracts data.invoices array', async () => {
    const { listCommunityInvoices } = await import('../api/invoices.js');

    mock.onGet('/communities/comm-1/invoices').reply(200, {
      invoices: [{ id: 'inv-1', concept: 'Monthly fee' }],
    });

    const result = await listCommunityInvoices('comm-1');

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('concept', 'Monthly fee');
  });

  it('createInvoice: calls correct URL', async () => {
    const { createInvoice } = await import('../api/invoices.js');

    mock.onPost('/communities/comm-1/invoices').reply(201, {
      invoice: { id: 'inv-new', concept: 'New Invoice' },
    });

    const result = await createInvoice('comm-1', {
      type: 'INDIVIDUAL',
      concept: 'New Invoice',
      dueDate: '2025-12-31',
    });

    expect(result).toHaveProperty('id', 'inv-new');
  });

  it('recordPayment: calls /invoices/items/:itemId/payments', async () => {
    const { recordPayment } = await import('../api/invoices.js');

    mock.onPost('/invoices/items/item-1/payments').reply(201, {
      payment: { id: 'pay-1', amount: 100 },
    });

    const result = await recordPayment('item-1', { amount: 100 });

    expect(result).toHaveProperty('id', 'pay-1');
    expect(mock.history.post[0].url).toBe('/invoices/items/item-1/payments');
  });
});

// ============================================================================
// api/notifications.js
// ============================================================================

describe('api/notifications.js', () => {
  it('listNotifications: extracts data.notifications array', async () => {
    const { listNotifications } = await import('../api/notifications.js');

    mock.onGet('/me/notifications').reply(200, {
      notifications: [
        { id: 'notif-1', title: 'New invoice', readAt: null },
        { id: 'notif-2', title: 'Meeting scheduled', readAt: '2025-05-01' },
      ],
    });

    const result = await listNotifications();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('title', 'New invoice');
  });

  it('listNotifications: calls correct URL /me/notifications', async () => {
    const { listNotifications } = await import('../api/notifications.js');

    mock.onGet('/me/notifications').reply(200, { notifications: [] });

    await listNotifications();

    expect(mock.history.get[0].url).toBe('/me/notifications');
  });

  it('markNotificationRead: calls PATCH /me/notifications/:id/read', async () => {
    const { markNotificationRead } = await import('../api/notifications.js');

    mock.onPatch('/me/notifications/notif-1/read').reply(204);

    await markNotificationRead('notif-1');

    expect(mock.history.patch[0].url).toBe('/me/notifications/notif-1/read');
  });

  it('markAllRead: calls PATCH /me/notifications/read-all', async () => {
    const { markAllRead } = await import('../api/notifications.js');

    mock.onPatch('/me/notifications/read-all').reply(204);

    await markAllRead();

    expect(mock.history.patch[0].url).toBe('/me/notifications/read-all');
  });
});

// ============================================================================
// api/communities.js
// ============================================================================

describe('api/communities.js', () => {
  it('listCommunities: extracts data.communities', async () => {
    const { listCommunities } = await import('../api/communities.js');

    mock.onGet('/communities').reply(200, {
      communities: [
        { id: 'comm-1', name: 'Residencial Sol' },
        { id: 'comm-2', name: 'Edificio Luna' },
      ],
    });

    const result = await listCommunities();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('name', 'Residencial Sol');
    // Must NOT return the full wrapper object
    expect(result).not.toHaveProperty('communities');
  });

  it('listCommunities: calls correct URL /communities', async () => {
    const { listCommunities } = await import('../api/communities.js');

    mock.onGet('/communities').reply(200, { communities: [] });

    await listCommunities();

    expect(mock.history.get[0].url).toBe('/communities');
  });

  it('getCommunity: extracts data.community', async () => {
    const { getCommunity } = await import('../api/communities.js');

    mock.onGet('/communities/comm-1').reply(200, {
      community: { id: 'comm-1', name: 'Test Community', units: [] },
    });

    const result = await getCommunity('comm-1');

    expect(result).toHaveProperty('id', 'comm-1');
    expect(result).not.toHaveProperty('community');
  });

  it('createCommunity: calls POST /communities', async () => {
    const { createCommunity } = await import('../api/communities.js');

    mock.onPost('/communities').reply(201, {
      community: { id: 'comm-new', name: 'New Community' },
    });

    const result = await createCommunity({ name: 'New Community', address: '123 St' });

    expect(result).toHaveProperty('id', 'comm-new');
    expect(mock.history.post[0].url).toBe('/communities');
  });
});

// ============================================================================
// api/reports.js
// ============================================================================

describe('api/reports.js', () => {
  it('downloadMorosos: calls correct URL /communities/:id/reports/morosos with blob responseType', async () => {
    const { downloadMorosos } = await import('../api/reports.js');

    // Mock URL.createObjectURL and anchor click to avoid DOM errors
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });

    const mockClick = vi.fn();
    const mockAppend = vi.fn();
    const mockAnchor = { href: '', download: '', click: mockClick };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor);

    mock.onGet('/communities/comm-1/reports/morosos').reply(200, new Blob(['%PDF-1.4']));

    await downloadMorosos('comm-1');

    expect(mock.history.get[0].url).toBe('/communities/comm-1/reports/morosos');
    expect(mock.history.get[0].responseType).toBe('blob');

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('downloadBudget: calls correct URL /communities/:id/reports/budget', async () => {
    const { downloadBudget } = await import('../api/reports.js');

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      href: '',
      download: '',
      click: vi.fn(),
    });

    mock.onGet('/communities/comm-1/reports/budget').reply(200, new Blob(['%PDF']));

    await downloadBudget('comm-1');

    expect(mock.history.get[0].url).toBe('/communities/comm-1/reports/budget');
    expect(mock.history.get[0].responseType).toBe('blob');

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('downloadPayments: includes query params for date range', async () => {
    const { downloadPayments } = await import('../api/reports.js');

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      href: '',
      download: '',
      click: vi.fn(),
    });

    mock
      .onGet('/communities/comm-1/reports/payments?from=2025-01-01&to=2025-12-31')
      .reply(200, new Blob(['%PDF']));

    await downloadPayments('comm-1', '2025-01-01', '2025-12-31');

    expect(mock.history.get[0].url).toContain('/communities/comm-1/reports/payments');
    expect(mock.history.get[0].url).toContain('from=2025-01-01');
    expect(mock.history.get[0].url).toContain('to=2025-12-31');

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});

// ============================================================================
// api/unitNotes.js
// ============================================================================

describe('api/unitNotes.js', () => {
  it('listUnitNotes: extracts data.notes', async () => {
    const { listUnitNotes } = await import('../api/unitNotes.js');

    mock.onGet('/units/unit-1/notes').reply(200, {
      notes: [
        { id: 'note-1', content: 'Has a dog', author: { firstName: 'Admin', lastName: 'A' } },
      ],
    });

    const result = await listUnitNotes('unit-1');

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('content', 'Has a dog');
  });

  it('listUnitNotes: calls correct URL /units/:unitId/notes', async () => {
    const { listUnitNotes } = await import('../api/unitNotes.js');

    mock.onGet('/units/unit-1/notes').reply(200, { notes: [] });

    await listUnitNotes('unit-1');

    expect(mock.history.get[0].url).toBe('/units/unit-1/notes');
  });

  it('addUnitNote: calls correct URL and returns note', async () => {
    const { addUnitNote } = await import('../api/unitNotes.js');

    mock.onPost('/units/unit-1/notes').reply(201, {
      note: { id: 'note-new', content: 'New note' },
    });

    const result = await addUnitNote('unit-1', 'New note');

    expect(result).toHaveProperty('id', 'note-new');
    expect(mock.history.post[0].url).toBe('/units/unit-1/notes');
  });
});

// ============================================================================
// api/incidents.js
// ============================================================================

describe('api/incidents.js', () => {
  it('listIncidents: calls correct nested URL and extracts incidents', async () => {
    const { listIncidents } = await import('../api/incidents.js');

    mock.onGet('/communities/comm-1/incidents').reply(200, {
      incidents: [
        { id: 'inc-1', title: 'Broken light', status: 'OPEN' },
      ],
    });

    const result = await listIncidents('comm-1');

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('title', 'Broken light');
    expect(mock.history.get[0].url).toBe('/communities/comm-1/incidents');
  });

  it('createIncident: calls correct nested URL', async () => {
    const { createIncident } = await import('../api/incidents.js');

    mock.onPost('/communities/comm-1/incidents').reply(201, {
      incident: { id: 'inc-new', title: 'Water leak' },
    });

    const result = await createIncident('comm-1', {
      title: 'Water leak',
      description: 'Basement flooding',
    });

    expect(result).toHaveProperty('id', 'inc-new');
    expect(mock.history.post[0].url).toBe('/communities/comm-1/incidents');
  });

  it('addIncidentPhoto: calls correct nested URL with incidentId', async () => {
    const { addIncidentPhoto } = await import('../api/incidents.js');

    mock
      .onPost('/communities/comm-1/incidents/inc-1/photos')
      .reply(201, { incident: { id: 'inc-1', photos: ['data:image/png;base64,...'] } });

    await addIncidentPhoto('comm-1', 'inc-1', 'data:image/png;base64,abc');

    expect(mock.history.post[0].url).toBe('/communities/comm-1/incidents/inc-1/photos');
  });
});

// ============================================================================
// Error handling tests
// ============================================================================

describe('Error handling', () => {
  it('listTemplates: propagates server errors', async () => {
    const { listTemplates } = await import('../api/templates.js');

    mock.onGet('/communities/comm-1/templates').reply(500, {
      error: { code: 'INTERNAL_ERROR', message: 'Server error' },
    });

    await expect(listTemplates('comm-1')).rejects.toThrow();
  });

  it('createReservation: propagates 403 forbidden errors', async () => {
    const { createReservation } = await import('../api/areas.js');

    mock
      .onPost('/communities/comm-1/areas/area-1/reservations')
      .reply(403, { error: { code: 'FORBIDDEN', message: 'Not allowed' } });

    await expect(
      createReservation('comm-1', 'area-1', { startAt: '2025-07-01T10:00:00Z', endAt: '2025-07-01T12:00:00Z' })
    ).rejects.toThrow();
  });

  it('listCommunities: propagates 401 unauthorized errors', async () => {
    const { listCommunities } = await import('../api/communities.js');

    mock.onGet('/communities').reply(401, {
      error: { code: 'UNAUTHORIZED', message: 'Token required' },
    });

    await expect(listCommunities()).rejects.toThrow();
  });
});
