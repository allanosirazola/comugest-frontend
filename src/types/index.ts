export type UserRole = 'SUPPORT' | 'ADMIN_FINCAS' | 'VECINO';
export type UserStatus = 'INVITED' | 'PENDING' | 'ACTIVE' | 'DISABLED';
export type UnitType = 'VIVIENDA' | 'LOCAL' | 'GARAJE' | 'TRASTERO';
export type InvoiceType = 'DERRAMA' | 'INDIVIDUAL';
export type PaymentMethod = 'BANK_TRANSFER' | 'CARD' | 'CASH' | 'DIRECT_DEBIT' | 'OTHER';
export type ComputedInvoiceStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type ComputedItemStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  locale: 'es' | 'en';
}

export interface AuthResponse { accessToken: string; refreshToken: string; user: User; }
export interface RegisterResponse { requiresEmailVerification: true; email: string; }
export interface InvitationInfo { email: string; firstName: string; communityName: string; expiresAt: string; }

export interface CommunitySummary {
  id: string; name: string; address: string; city: string; postalCode: string; country: string;
  cif: string | null; redirectMessagesTo: string | null; createdAt: string;
  _count: { units: number };
}

export interface UnitRelation { id: string; firstName: string; lastName: string; email: string; status: UserStatus; }

export interface Unit {
  id: string; communityId: string; type: UnitType; label: string; floor: string | null; door: string | null;
  coefficient: string; surfaceM2: string | null; customFields: Record<string, unknown>;
  ownerships?: Array<{ owner: UnitRelation }>;
  occupancies?: Array<{ occupant: UnitRelation }>;
}

export interface UnitListItem extends Omit<Unit, 'ownerships' | 'occupancies'> {
  ownerships: Array<{ ownerId: string }>;
  occupancies: Array<{ occupantId: string }>;
}

export interface CommunityDetail extends CommunitySummary {
  units: Unit[];
  admins: Array<{ user: { id: string; firstName: string; lastName: string; email: string } }>;
}

export interface Payment {
  id: string;
  invoiceItemId: string;
  amount: string;
  paidAt: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  registeredById: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  unitId: string;
  amount: string;
  consumptionValue: string | null;
  consumptionUnit: string | null;
  notes: string | null;
  payments: Payment[];
  unit: { id: string; label: string; type: UnitType };
  status: ComputedItemStatus;
}

export interface InvoiceSummary {
  id: string;
  communityId: string;
  type: InvoiceType;
  concept: string;
  description: string | null;
  totalAmount: string;
  issueDate: string;
  dueDate: string;
  attachmentUrl: string | null;
  status: ComputedInvoiceStatus;
  paidAmount: number;
  pendingAmount: number;
  total: number;
}

export interface InvoiceDetail extends InvoiceSummary {
  community: { id: string; name: string };
  issuedBy: { firstName: string; lastName: string; email: string };
  items: InvoiceItem[];
}

export interface MyInvoiceItem {
  id: string;
  amount: string;
  consumptionValue: string | null;
  consumptionUnit: string | null;
  notes: string | null;
  payments: Payment[];
  status: ComputedItemStatus;
  unit: { id: string; label: string; type: UnitType };
  invoice: {
    id: string;
    concept: string;
    description: string | null;
    type: InvoiceType;
    issueDate: string;
    dueDate: string;
    attachmentUrl: string | null;
    community: { id: string; name: string };
  };
}

export interface OverdueByOwner {
  owner: { id: string; firstName: string; lastName: string; email: string };
  totalPending: number;
  items: Array<{
    id: string;
    amount: string;
    payments: Payment[];
    invoice: { id: string; concept: string; dueDate: string; issueDate: string; type: InvoiceType };
    unit: { id: string; label: string };
  }>;
}

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}

export interface Announcement {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  body: string;
  pinned: boolean;
  publishedAt: string;
  createdAt: string;
  author: { firstName: string; lastName: string };
  community?: { id: string; name: string };
}

export interface ConversationSummary {
  id: string;
  communityId: string;
  community: { id: string; name: string };
  resident: { id: string; firstName: string; lastName: string; email: string };
  lastMessage: Message | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  fromAdmin: boolean;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface MessagesResponse {
  conversation: { id: string; communityId: string; residentId: string };
  isAdmin: boolean;
  messages: Message[];
}

export type ExpenseCategory =
  | 'CLEANING'
  | 'LIFT'
  | 'GARBAGE'
  | 'GARDENING'
  | 'MAINTENANCE'
  | 'INSURANCE'
  | 'ELECTRICITY'
  | 'WATER'
  | 'SECURITY'
  | 'ADMIN_FEES'
  | 'SUPPLIES'
  | 'OTHER';

export interface Expense {
  id: string;
  communityId: string;
  category: ExpenseCategory;
  concept: string;
  description: string | null;
  amount: string;
  expenseDate: string;
  supplier: string | null;
  attachmentUrl?: string | null;
  recordedBy?: { firstName: string; lastName: string };
}

export interface CategorySummary {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface ExpensesResult {
  expenses: Expense[];
  summary: { total: number; byCategory: CategorySummary[] };
}

export type TicketCategory = 'BUG' | 'FEATURE_REQUEST' | 'QUESTION' | 'BILLING' | 'OTHER';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketPerson {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: UserRole;
}

export interface TicketComment {
  id: string;
  body: string;
  internal: boolean;
  createdAt: string;
  author: TicketPerson;
}

export interface Ticket {
  id: string;
  reporterId: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string;
  pageUrl: string | null;
  userAgent: string | null;
  assignedToId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: TicketPerson;
  assignedTo?: TicketPerson | null;
  comments?: TicketComment[];
  _count?: { comments: number };
}

export interface SupportMetrics {
  users: { total: number; admins: number; residents: number; support: number; newLast30Days: number };
  platform: { communities: number; units: number; activeInvoices: number };
  tickets: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byCategory: Array<{ category: TicketCategory; count: number }>;
  };
  recentTickets: Array<{ id: string; subject: string; status: TicketStatus; priority: TicketPriority; createdAt: string }>;
}

export type ProcedureType =
  | 'CERTIFICATE'
  | 'MAINTENANCE'
  | 'DOCUMENT_REQUEST'
  | 'COMPLAINT'
  | 'PERMISSION'
  | 'OTHER';
export type ProcedureStatus = 'SUBMITTED' | 'IN_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface ProcedureUpdate {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; role?: UserRole };
}

export interface Procedure {
  id: string;
  communityId: string;
  requesterId: string;
  type: ProcedureType;
  status: ProcedureStatus;
  subject: string;
  description: string;
  unitId: string | null;
  resolution: string | null;
  attachmentUrl: string | null;
  handledById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  community?: { id: string; name: string };
  requester?: { id: string; firstName: string; lastName: string; email?: string };
  unit?: { id: string; label: string } | null;
  handledBy?: { id: string; firstName: string; lastName: string } | null;
  updates?: ProcedureUpdate[];
  canManage?: boolean;
  _count?: { updates: number };
}
