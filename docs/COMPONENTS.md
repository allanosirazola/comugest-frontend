# Comugest Frontend — Components Reference

All reusable components live in `src/components/`. Pages live in `src/pages/` and are not documented here.

---

## Layout

**File**: `src/components/Layout.jsx`

The main application shell. Wraps every authenticated page. Renders the header (logo, nav links, user info, notifications) and the main content area.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | ReactNode | Yes | Page content rendered inside the layout |

### What it renders

- Fixed header with Comugest logo and brand name
- Role-aware navigation links:
  - Admin: Dashboard, Communities, Invite Resident
  - Resident: Dashboard, My Invoices, Expenses, Procedures, Board
  - Common for all: Messages, Report Issue, Profile, Help
  - Support-only: Support link
- `NotificationBell` (top right)
- `DarkModeToggle`
- `LanguageSwitcher`
- User name + email display
- Logout button

### Usage

```jsx
import { Layout } from '@/components/Layout';

function MyPage() {
  return (
    <Layout>
      <h1>My Page Content</h1>
    </Layout>
  );
}
```

Most pages call `<Layout>` as their outermost wrapper.

---

## ProtectedRoute

**File**: `src/components/ProtectedRoute.jsx`

Authentication and authorization guard for route elements.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | ReactNode | Yes | The route element to render when access is granted |
| `allowedRoles` | string[] | No | Roles that can access this route. If omitted, any authenticated user can access |

### Behavior

1. Shows a centered loading spinner while `AuthContext.isLoading` is true
2. Redirects to `/login` (preserving `location.state.from`) if not authenticated
3. Redirects to `/` if authenticated but role is not in `allowedRoles`
4. Renders `children` if all checks pass

### Usage

```jsx
// Any authenticated user
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Admin only
<ProtectedRoute allowedRoles={['ADMIN_FINCAS', 'SUPPORT']}>
  <CommunitiesListPage />
</ProtectedRoute>

// Single role
<ProtectedRoute allowedRoles={['SUPPORT']}>
  <SupportDashboardPage />
</ProtectedRoute>
```

---

## StatusBadge

**File**: `src/components/StatusBadge.jsx`

Generic colored pill for status values.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `status` | string | Yes | Status value — determines color |
| `label` | string | No | Display text. Defaults to the `status` value if not provided |

### Color mapping

| Status value | Color |
|---|---|
| `ACTIVE`, `CONFIRMED`, `COMPLETED`, `RESOLVED`, `HELD` | Green |
| `PENDING`, `IN_REVIEW`, `IN_PROGRESS`, `SCHEDULED` | Yellow/amber |
| `DISABLED`, `CANCELLED`, `CLOSED`, `REJECTED` | Red/gray |
| Other | Default gray |

### Usage

```jsx
import { StatusBadge } from '@/components/StatusBadge';

<StatusBadge status="ACTIVE" />
<StatusBadge status="PENDING" label="En espera" />
```

---

## TicketBadges

**File**: `src/components/TicketBadges.jsx`

Exports two specialized badge components for support tickets.

### TicketStatusBadge

| Prop | Type | Description |
|---|---|---|
| `status` | string | `OPEN` \| `IN_PROGRESS` \| `RESOLVED` \| `CLOSED` |

### TicketPriorityBadge

| Prop | Type | Description |
|---|---|---|
| `priority` | string | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` |

Color mapping:
- `URGENT` → red
- `HIGH` → orange
- `MEDIUM` → yellow
- `LOW` → gray

### Usage

```jsx
import { TicketStatusBadge, TicketPriorityBadge } from '@/components/TicketBadges';

<TicketStatusBadge status="IN_PROGRESS" />
<TicketPriorityBadge priority="HIGH" />
```

---

## ProcedureStatusBadge

**File**: `src/components/ProcedureStatusBadge.jsx`

Colored pill for `ProcedureStatus` values.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `status` | string | Yes | `SUBMITTED` \| `IN_REVIEW` \| `IN_PROGRESS` \| `COMPLETED` \| `REJECTED` |

### Usage

```jsx
import { ProcedureStatusBadge } from '@/components/ProcedureStatusBadge';

<ProcedureStatusBadge status="COMPLETED" />
```

---

## ExpenseBreakdown

**File**: `src/components/ExpenseBreakdown.jsx`

Visualization component that renders expense totals by category.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `expenses` | Expense[] | Yes | Array of expense objects with `category` and `amount` |
| `budget` | BudgetLine[] | No | Optional budget lines to compare against actual |
| `type` | `'pie'` \| `'bar'` | No | Chart type. Defaults to `'bar'` |

### What it renders

A Recharts `PieChart` or `BarChart` showing total spending per `ExpenseCategory`. When `budget` is provided, renders a grouped bar chart comparing budget vs actual.

### Usage

```jsx
import { ExpenseBreakdown } from '@/components/ExpenseBreakdown';

<ExpenseBreakdown
  expenses={expenses}
  budget={budgetLines}
  type="bar"
/>
```

---

## NotificationBell

**File**: `src/components/NotificationBell.jsx`

Bell icon with unread count badge and dropdown notification list.

### Props

None (reads from `useNotifications` hook internally).

### What it renders

- Bell icon button with red badge showing unread notification count
- Dropdown panel listing recent notifications (title, body, time)
- Click on notification navigates to `notification.url`
- "Mark all as read" button

### API calls

- `GET /me/notifications` (via `useNotifications` hook, polled every 30s)
- `POST /me/notifications/mark-all-read`
- `PATCH /me/notifications/:id/read`

### Usage

```jsx
// Used internally by Layout.jsx
import { NotificationBell } from '@/components/NotificationBell';

<NotificationBell />
```

---

## LanguageSwitcher

**File**: `src/components/LanguageSwitcher.jsx`

Toggle button to switch between `es` (Spanish) and `en` (English).

### Props

None.

### What it renders

A button or select showing the current language code. Clicking cycles through available languages or opens a dropdown.

### Behavior

Calls `i18next.changeLanguage(code)` and persists the choice to `localStorage` (handled by `i18next-browser-languagedetector`).

### Usage

```jsx
// Used internally by Layout.jsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

<LanguageSwitcher />
```

---

## DarkModeToggle

**File**: `src/components/DarkModeToggle.jsx`

Toggle between light and dark mode.

### Props

None.

### What it renders

A sun/moon icon button.

### Behavior

- Reads preference from `localStorage` key `comugest_theme`
- Adds/removes `dark` class on `document.documentElement`
- Tailwind uses `darkMode: 'class'` strategy so all `dark:` variants respond immediately

### Usage

```jsx
// Used internally by Layout.jsx
import { DarkModeToggle } from '@/components/DarkModeToggle';

<DarkModeToggle />
```

---

## OnboardingWizard

**File**: `src/components/OnboardingWizard.jsx`

Multi-step onboarding wizard shown to admin users who have not yet completed initial setup.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `communityId` | string | Yes | ID of the community being set up |
| `onComplete` | () => void | Yes | Callback when all steps are completed |

### What it renders

A stepped dialog/card showing:
1. Community details review
2. Create first unit
3. Invite first resident
4. Summary / done

### Usage

```jsx
import { OnboardingWizard } from '@/components/OnboardingWizard';

// Typically rendered conditionally from Dashboard or CommunityDetail
{showOnboarding && (
  <OnboardingWizard
    communityId={community.id}
    onComplete={() => setShowOnboarding(false)}
  />
)}
```

---

## Custom Hooks (src/hooks/)

Each hook in `src/hooks/` wraps TanStack Query. Common patterns:

### Query hooks

```javascript
// Pattern: return { data, isLoading, error }
const { data: communities, isLoading } = useCommunities();
```

### Mutation hooks

```javascript
// Pattern: return mutation object with mutate() / mutateAsync()
const createInvoice = useCreateInvoice(communityId);
createInvoice.mutate({ type: 'DERRAMA', concept: '...', totalAmount: 5000, dueDate: '...' });
```

### Hook list

| Hook file | Main exports | Notes |
|---|---|---|
| `useAdmin.js` | `useKpis()` | Platform KPIs |
| `useAreas.js` | `useAreas()`, `useReservations()`, `useCreateArea()`, `useCreateReservation()`, `useCancelReservation()` | Common areas |
| `useBanking.js` | `useBankAccounts()`, `useTransactions()`, `useReconcile()` | GoCardless |
| `useBilling.js` | `useBillingStatus()`, `useCreateCheckout()`, `useCreatePortal()` | Stripe |
| `useBudgets.js` | `useBudget()`, `useUpsertBudget()` | Annual budgets |
| `useCalendar.js` | `useCommunityCalendar()`, `useMyCalendar()` | Calendar events |
| `useCoAdmins.js` | `useCoAdmins()`, `useAddCoAdmin()`, `useRemoveCoAdmin()` | Co-admin management |
| `useComms.js` | `useConversations()`, `useConversation()`, `useSendMessage()`, `useMarkRead()` | Chat |
| `useCommunities.js` | `useCommunities()`, `useCommunity()`, `useCreateCommunity()`, `useUpdateCommunity()` | Communities |
| `useDelinquency.js` | `useDelinquency()`, `useUnitDelinquency()` | Overdue report |
| `useDocuments.js` | `useCommunityDocuments()`, `useMyDocuments()`, `useUploadDocument()` | Documents |
| `useExpenses.js` | `useExpenses()`, `useMyExpenses()`, `useCreateExpense()`, `useDeleteExpense()` | Expenses |
| `useIncidents.js` | `useIncidents()`, `useCreateIncident()`, `useUpdateIncident()` | Incidents |
| `useInvoices.js` | `useInvoices()`, `useInvoice()`, `useCreateInvoice()`, `useRecordPayment()`, `useCancelInvoice()` | Invoices |
| `useMe.js` | `useProfile()`, `useUpdateProfile()`, `useChangePassword()`, `useSetup2FA()` | Profile |
| `useMeetings.js` | `useMeetings()`, `useMeeting()`, `useCreateMeeting()`, `useUpdateAttendance()`, `useSaveMinutes()`, `useSignMinutes()` | Meetings |
| `useMeterReadings.js` | `useMeterReadings()`, `useAddReading()` | Meter readings |
| `useNotifications.js` | `useNotifications()`, `useMarkAllRead()` | In-app notifications |
| `usePolls.js` | `usePolls()`, `useCreatePoll()`, `useCastVote()`, `useClosePoll()` | Meeting polls |
| `useProcedures.js` | `useProcedures()`, `useProcedure()`, `useCreateProcedure()`, `useUpdateProcedure()` | Procedures |
| `usePush.js` | `usePushSubscription()` | Web Push subscription |
| `useRecurring.js` | `useRecurring()`, `useCreateRecurring()`, `useTriggerRecurring()` | Recurring invoices |
| `useSuppliers.js` | `useSuppliers()`, `useCreateSupplier()`, `useUpdateSupplier()`, `useDeleteSupplier()` | Suppliers |
| `useTemplates.js` | `useTemplates()`, `useCreateTemplate()`, `useUpdateTemplate()` | Message templates |
| `useTickets.js` | `useMyTickets()`, `useTicket()`, `useCreateTicket()`, `useAddComment()` | Support tickets |
| `useUnitNotes.js` | `useUnitNotes()`, `useAddNote()`, `useDeleteNote()` | Private unit notes |
| `useWaitlist.js` | `useWaitlist()`, `useJoinWaitlist()`, `useLeaveWaitlist()` | Area waitlist |
