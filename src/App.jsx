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
import { SoporteLoginPage } from '@/pages/SoporteLogin';
import { NotFoundPage } from '@/pages/NotFound';

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
            <Route path="/invoices/:id" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><InvoiceDetailPage /></ProtectedRoute>} />
            <Route path="/admin/invite" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><InviteResidentPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
