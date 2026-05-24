# Comugest Frontend — Contributing Guide

---

## Table of Contents

1. [Git Workflow](#git-workflow)
2. [Code Style](#code-style)
3. [Adding a New Page](#adding-a-new-page)
4. [Adding a New API Endpoint](#adding-a-new-api-endpoint)
5. [i18n Requirements](#i18n-requirements)
6. [PR Checklist](#pr-checklist)

---

## Git Workflow

### Branches

The main integration branch is `claude/blissful-goldberg-h42sy`.

All new work should branch from it:

```bash
git checkout claude/blissful-goldberg-h42sy
git pull
git checkout -b feature/my-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/<short-description>` — new functionality
- `fix/<short-description>` — bug fix
- `refactor/<short-description>` — code restructuring without behavior change
- `docs/<short-description>` — documentation only

### Commits

Write clear, imperative commit messages:

```
feat: add expense breakdown chart to community detail
fix: prevent double-submit on invoice payment form
refactor: extract StatusBadge into shared component
docs: update PAGES.md with new BillingPage entry
```

Use conventional commit prefixes: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`.

### Pull Requests

1. Push your branch to the remote
2. Open a PR targeting `claude/blissful-goldberg-h42sy`
3. Fill the PR description with: what changed, why, screenshots for UI changes
4. Complete the [PR Checklist](#pr-checklist) before requesting review
5. Require at least one approval before merging
6. Use squash merge to keep the integration branch clean

---

## Code Style

### Linting and formatting

```bash
npm run lint      # ESLint — check for errors and style issues
npm run format    # Prettier — auto-format all src/**/*.{js,jsx,css}
```

Both run automatically on pre-commit if you have the pre-commit hook installed.

### ESLint rules

The project uses `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`. Key enforced rules:
- All hooks must follow Rules of Hooks (no conditional calls)
- `react-refresh/only-export-components` — components must be the default or named export

### General conventions

| Rule | Details |
|---|---|
| File names | PascalCase for components and pages (`MyComponent.jsx`), camelCase for hooks and utilities (`useMyHook.js`, `myHelper.js`) |
| Named exports | Always use named exports (no default exports for pages/components) |
| Prop types | No PropTypes library — use JSDoc comments or TypeScript migration for critical components |
| CSS | Tailwind utility classes only — no inline `style={{}}` except for dynamic values not expressible in Tailwind |
| Imports | Use `@/` alias for absolute imports from `src/` (configured in `vite.config.js`) |
| Async | `async/await` over `.then()` chains |
| Error handling | Always handle mutation errors with `try/catch` or `.catch()` and display user feedback |

### Component structure

```jsx
// 1. Imports
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyHook } from '@/hooks/useMyHook';
import { Layout } from '@/components/Layout';

// 2. Named export at the top level
export function MyPage() {
  // 3. Hooks (no conditionals here)
  const { t } = useTranslation();
  const { data, isLoading } = useMyHook();

  // 4. Derived state / handlers
  const handleSubmit = async (data) => { ... };

  // 5. Loading / error states
  if (isLoading) return <div>{t('common.loading')}</div>;

  // 6. JSX return
  return (
    <Layout>
      <h1>{t('myPage.title')}</h1>
    </Layout>
  );
}
```

---

## Adding a New Page

Follow these steps to add a new page to the application.

### Step 1 — Create the page file

Create `src/pages/MyNewPage.jsx`:

```jsx
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';

export function MyNewPage() {
  const { t } = useTranslation();
  return (
    <Layout>
      <h1>{t('myNewPage.title')}</h1>
    </Layout>
  );
}
```

### Step 2 — Add translation keys

Add keys to both `src/i18n/locales/es.json` and `src/i18n/locales/en.json`:

```json
// es.json
{
  "myNewPage": {
    "title": "Mi nueva página"
  }
}

// en.json
{
  "myNewPage": {
    "title": "My new page"
  }
}
```

### Step 3 — Register the route in App.jsx

Import the page and add a `<Route>` inside the appropriate role group:

```jsx
// At the top of App.jsx
import { MyNewPage } from '@/pages/MyNewPage';

// Inside <Routes> (in the appropriate role section):
<Route
  path="/my-new-path"
  element={
    <ProtectedRoute allowedRoles={['ADMIN_FINCAS', 'SUPPORT']}>
      <MyNewPage />
    </ProtectedRoute>
  }
/>
```

For a publicly accessible page, omit `<ProtectedRoute>`:
```jsx
<Route path="/my-new-path" element={<MyNewPage />} />
```

### Step 4 — Add navigation link (if needed)

If the page should appear in the nav, edit `src/components/Layout.jsx` and add a `<NavLink>`.

### Step 5 — Add API module and hook (if needed)

See [Adding a New API Endpoint](#adding-a-new-api-endpoint).

### Step 6 — Document the page

Add an entry to `docs/PAGES.md` following the existing format.

### Step 7 — Write a test (if applicable)

Create `src/test/MyNewPage.test.jsx` with at minimum a smoke test.

---

## Adding a New API Endpoint

Follow these steps when the backend adds a new endpoint that the frontend needs to consume.

### Step 1 — Add the API function

Find the relevant file in `src/api/` or create a new one.

```javascript
// src/api/myModule.js
import { api } from './client';

export const getMyData = (id) =>
  api.get(`/my-module/${id}`).then((r) => r.data);

export const createMyThing = (payload) =>
  api.post('/my-module', payload).then((r) => r.data);

export const updateMyThing = (id, payload) =>
  api.patch(`/my-module/${id}`, payload).then((r) => r.data);

export const deleteMyThing = (id) =>
  api.delete(`/my-module/${id}`).then((r) => r.data);
```

All API functions return the response `.data` directly (not the Axios response object).

### Step 2 — Create a hook

Create or update the corresponding hook in `src/hooks/`:

```javascript
// src/hooks/useMyModule.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/myModule';

// Query key factory — keeps cache keys consistent
const keys = {
  all: ['myModule'],
  list: (filters) => ['myModule', 'list', filters],
  detail: (id) => ['myModule', 'detail', id],
};

export function useMyData(id) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => api.getMyData(id),
    enabled: !!id,
  });
}

export function useCreateMyThing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createMyThing,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
```

### Step 3 — Use the hook in a page or component

```jsx
import { useMyData, useCreateMyThing } from '@/hooks/useMyModule';

export function MyPage() {
  const { data, isLoading } = useMyData(id);
  const create = useCreateMyThing();

  const handleCreate = async (formData) => {
    try {
      await create.mutateAsync(formData);
      // success feedback
    } catch (err) {
      // error feedback
    }
  };
  // ...
}
```

### Step 4 — Handle errors

Always show user-facing error feedback:

```jsx
{create.isError && (
  <p className="text-clay-600">
    {t('common.errorOccurred')}: {create.error?.response?.data?.error?.message}
  </p>
)}
```

---

## i18n Requirements

Every user-visible string **must** be translated. No hardcoded Spanish or English text in components.

### Rules

1. All strings that appear in the UI must use `t('key')` from `useTranslation()`
2. Every new key must be added to **both** `es.json` and `en.json` simultaneously
3. Keys must be descriptive and namespaced: `module.context.label`
4. Never translate keys (the keys themselves are always in English or camelCase)
5. Date formatting must use `i18n.language` for locale-aware display
6. Amounts must account for locale decimal separators (use `Intl.NumberFormat`)

### Key naming conventions

```
common.loading          → "Cargando..." / "Loading..."
common.save             → "Guardar" / "Save"
common.cancel           → "Cancelar" / "Cancel"
common.delete           → "Eliminar" / "Delete"
common.confirm          → "Confirmar" / "Confirm"
common.errorOccurred    → "Ha ocurrido un error" / "An error occurred"
common.noResults        → "Sin resultados" / "No results"

nav.dashboard           → "Inicio" / "Dashboard"
nav.communities         → "Comunidades" / "Communities"

invoices.title          → "Facturas" / "Invoices"
invoices.createButton   → "Nueva factura" / "New invoice"
invoices.status.paid    → "Pagado" / "Paid"
invoices.status.pending → "Pendiente" / "Pending"
```

### Adding a key

1. Choose a key following the conventions above
2. Add it to `src/i18n/locales/es.json` with the Spanish value
3. Add it to `src/i18n/locales/en.json` with the English value
4. Use `t('your.key')` in the component
5. Never add a key to one file without adding it to the other

### Interpolation

```javascript
// Key: "invoices.itemCount": "{{count}} factura(s)"
t('invoices.itemCount', { count: 5 })
// → "5 factura(s)"
```

---

## PR Checklist

Before requesting review, confirm all of the following:

### Code quality

- [ ] `npm run lint` passes with no errors
- [ ] `npm run format` has been run (or there are no formatting issues)
- [ ] No `console.log` statements left in the code
- [ ] No hardcoded strings — all user-visible text uses `t()`

### i18n

- [ ] All new UI strings have keys in **both** `es.json` and `en.json`
- [ ] No missing translation keys (verify by switching language in dev)

### Functionality

- [ ] The feature works as expected in both light and dark mode
- [ ] The feature works with both Spanish and English locale
- [ ] Role-based access is correct (pages/actions visible only to authorized roles)
- [ ] Loading states are handled (no content flash)
- [ ] Error states are handled with user-facing feedback
- [ ] Forms have proper validation (Zod + react-hook-form)

### API integration

- [ ] New API functions are in `src/api/<module>.js`
- [ ] TanStack Query hooks correctly invalidate related caches on mutation success
- [ ] 401 errors trigger auto-refresh (handled by `client.js` interceptor — no action needed)

### Testing

- [ ] New pages/components have at least a render smoke test
- [ ] `npm run test` passes

### Documentation

- [ ] New pages documented in `docs/PAGES.md`
- [ ] New components documented in `docs/COMPONENTS.md`
- [ ] New hooks documented in the hook table in `docs/COMPONENTS.md`

### Routing

- [ ] New route added to `App.jsx` with correct `ProtectedRoute` configuration
- [ ] Route path follows the existing conventions (`/communities/:id/...` for community sub-pages)
