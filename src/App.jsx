import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { CheckEmailPage } from '@/pages/CheckEmail';
import { VerifyEmailPage } from '@/pages/VerifyEmail';
import { AcceptInvitationPage } from '@/pages/AcceptInvitation';
import { DashboardPage } from '@/pages/Dashboard';
import { InviteResidentPage } from '@/pages/InviteResident';
import { CommunitiesListPage } from '@/pages/CommunitiesList';
import { CreateCommunityPage } from '@/pages/CreateCommunity';
import { CommunityDetailPage } from '@/pages/CommunityDetail';
import { CommunityInvoicesPage } from '@/pages/CommunityInvoices';
import { CreateInvoicePage } from '@/pages/CreateInvoice';
import { InvoiceDetailPage } from '@/pages/InvoiceDetail';
import { MorososPage } from '@/pages/Morosos';
import { MyInvoicesPage } from '@/pages/MyInvoices';
import { ForgotPasswordPage } from '@/pages/ForgotPassword';
import { ResetPasswordPage } from '@/pages/ResetPassword';
import { CommunityAnnouncementsPage } from '@/pages/CommunityAnnouncements';
import { MyAnnouncementsPage } from '@/pages/MyAnnouncements';
import { MessagesPage } from '@/pages/Messages';
import { CommunityExpensesPage } from '@/pages/CommunityExpenses';
import { MyExpensesPage } from '@/pages/MyExpenses';
import { ReportIssuePage } from '@/pages/ReportIssue';
import { MyTicketsPage } from '@/pages/MyTickets';
import { TicketDetailPage } from '@/pages/TicketDetail';
import { SupportDashboardPage } from '@/pages/SupportDashboard';
import { CreateProcedurePage } from '@/pages/CreateProcedure';
import { MyProceduresPage } from '@/pages/MyProcedures';
import { ProcedureDetailPage } from '@/pages/ProcedureDetail';
import { CommunityProceduresPage } from '@/pages/CommunityProcedures';
import { CommunityBudgetPage } from '@/pages/CommunityBudget';
import { AuditLogPage } from '@/pages/AuditLog';
import { CommunityAreasPage } from '@/pages/CommunityAreas';
import { AreaReservationsPage } from '@/pages/AreaReservations';
import { CommunityMeetingsPage } from '@/pages/CommunityMeetings';
import { MeetingDetailPage } from '@/pages/MeetingDetail';
import { SoporteLoginPage } from '@/pages/SoporteLogin';
import { NotFoundPage } from '@/pages/NotFound';
import { ProfilePage } from '@/pages/ProfilePage';
import { MyReservationsPage } from '@/pages/MyReservations';
import { MyMeetingsPage } from '@/pages/MyMeetings';
import { CommunityRecurringPage } from '@/pages/CommunityRecurring';
import { CommunityDocumentsPage } from '@/pages/CommunityDocuments';
import { MyDocumentsPage } from '@/pages/MyDocuments';
import { CommunityReportsPage } from '@/pages/CommunityReports';
import { CommunityMeterReadingsPage } from '@/pages/CommunityMeterReadings';
import { CommunitySuppliersPage } from '@/pages/CommunitySuppliers';
import { CommunityCalendarPage } from '@/pages/CommunityCalendar';
import { MyCalendarPage } from '@/pages/MyCalendar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

const ADMIN_ROLES = ['ADMIN_FINCAS', 'SUPPORT'];

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/soporte" element={<SoporteLoginPage />} />
            <Route path="/check-email" element={<CheckEmailPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Cualquier usuario autenticado */}
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/my-invoices" element={<ProtectedRoute><MyInvoicesPage /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><MyAnnouncementsPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><MyExpensesPage /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><ReportIssuePage /></ProtectedRoute>} />
            <Route path="/my-tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
            <Route path="/procedures" element={<ProtectedRoute><MyProceduresPage /></ProtectedRoute>} />
            <Route path="/procedures/new" element={<ProtectedRoute><CreateProcedurePage /></ProtectedRoute>} />
            <Route path="/procedures/:id" element={<ProtectedRoute><ProcedureDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/my-reservations" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />
            <Route path="/my-meetings" element={<ProtectedRoute><MyMeetingsPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><MyDocumentsPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><MyCalendarPage /></ProtectedRoute>} />
            <Route path="/support/tickets" element={<ProtectedRoute allowedRoles={['SUPPORT']}><SupportDashboardPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute allowedRoles={['SUPPORT']}><SupportDashboardPage /></ProtectedRoute>} />

            {/* Solo admins */}
            <Route path="/communities" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunitiesListPage /></ProtectedRoute>} />
            <Route path="/communities/new" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CreateCommunityPage /></ProtectedRoute>} />
            <Route path="/communities/:id" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityDetailPage /></ProtectedRoute>} />
            <Route path="/communities/:id/invoices" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityInvoicesPage /></ProtectedRoute>} />
            <Route path="/communities/:id/invoices/new" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CreateInvoicePage /></ProtectedRoute>} />
            <Route path="/communities/:id/morosos" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><MorososPage /></ProtectedRoute>} />
            <Route path="/communities/:id/announcements" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityAnnouncementsPage /></ProtectedRoute>} />
            <Route path="/communities/:id/expenses" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityExpensesPage /></ProtectedRoute>} />
            <Route path="/communities/:id/procedures" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityProceduresPage /></ProtectedRoute>} />
            <Route path="/communities/:id/budget" element={<ProtectedRoute allowedRoles={['ADMIN_FINCAS','SUPPORT']}><CommunityBudgetPage /></ProtectedRoute>} />
            <Route path="/invoices/:id" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><InvoiceDetailPage /></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AuditLogPage /></ProtectedRoute>} />
            <Route path="/communities/:id/areas" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityAreasPage /></ProtectedRoute>} />
            <Route path="/communities/:communityId/areas/:areaId/reservations" element={<ProtectedRoute><AreaReservationsPage /></ProtectedRoute>} />
            <Route path="/communities/:id/meetings" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityMeetingsPage /></ProtectedRoute>} />
            <Route path="/communities/:id/meetings/:meetingId" element={<ProtectedRoute><MeetingDetailPage /></ProtectedRoute>} />
            <Route path="/communities/:id/recurring" element={<ProtectedRoute allowedRoles={['ADMIN_FINCAS','SUPPORT']}><CommunityRecurringPage /></ProtectedRoute>} />
            <Route path="/communities/:id/documents" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityDocumentsPage /></ProtectedRoute>} />
            <Route path="/communities/:id/reports" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityReportsPage /></ProtectedRoute>} />
            <Route path="/communities/:id/meter-readings" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityMeterReadingsPage /></ProtectedRoute>} />
            <Route path="/communities/:id/suppliers" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunitySuppliersPage /></ProtectedRoute>} />
            <Route path="/communities/:id/calendar" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><CommunityCalendarPage /></ProtectedRoute>} />
            <Route path="/admin/invite" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><InviteResidentPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
