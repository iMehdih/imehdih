// ── USER ROLES ──
export type UserRole = 'customer' | 'staff' | 'admin'

// ── USER ──
export interface IUser {
  _id: string
  mobile: string
  role: UserRole
  firstName?: string
  lastName?: string
  email?: string
  avatar?: string
  // حقوقی
  isLegal: boolean
  companyName?: string
  nationalId?: string
  economicCode?: string
  // وضعیت
  isActive: boolean
  isProfileComplete: boolean
  customerScore: number
  isVIP: boolean
  lastSeen: Date
  createdAt: Date
}

// ── STAFF ──
export interface IStaff extends IUser {
  role: 'staff'
  salary: number
  walletBalance: number
  rating: number
  totalTasks: number
  departments: string[]
}

// ── PRODUCT TYPES ──
export type ProductType =
  | 'theme'
  | 'plugin'
  | 'course'
  | 'file'
  | 'service_project'
  | 'service_recurring'
  | 'hosting'
  | 'domain'
  | 'subscription_pro'

// ── ORDER STATUS ──
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded'

// ── ORDER ──
export interface IOrder {
  _id: string
  orderNumber: string
  userId: string
  items: IOrderItem[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  couponCode?: string
  status: OrderStatus
  paymentRef?: string
  createdAt: Date
  updatedAt: Date
}

export interface IOrderItem {
  productId: string
  productType: ProductType
  title: string
  price: number
  discountedPrice: number
}

// ── TICKET ──
export type TicketDepartment =
  | 'support_theme_plugin'
  | 'support_course'
  | 'support_hosting_domain'
  | 'support_service'
  | 'support_subscription'
  | 'finance'
  | 'service_support'
  | 'presale'
  | 'management'

export type TicketStatus =
  | 'open'
  | 'in_review'
  | 'waiting_info'
  | 'in_progress'
  | 'answered'
  | 'special_handling'
  | 'waiting_payment'
  | 'resolved_pending_confirm'
  | 'closed'
  | 'cancelled'

export interface ITicket {
  _id: string
  ticketNumber: string
  userId: string
  department: TicketDepartment
  relatedProductId?: string
  relatedProductType?: ProductType
  relatedDomain?: string
  title: string
  status: TicketStatus
  assignedTo?: string
  messages: ITicketMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ITicketMessage {
  _id: string
  senderId: string
  senderRole: UserRole | 'system'
  content: string
  attachments: string[]
  createdAt: Date
}

// ── PROCESS ENGINE ──
export interface IServiceTemplate {
  _id: string
  productId: string
  productType: ProductType
  tasks: ITaskTemplate[]
}

export interface ITaskTemplate {
  _id: string
  title: string
  description: string
  order: number
  isRequired: boolean
  isBlocking: boolean
  fields: ITaskField[]
  recurringType?: 'weekly' | 'monthly' | 'custom'
  recurringInterval?: number
}

export interface ITaskField {
  name: string
  label: string
  type: 'text' | 'number' | 'image' | 'file' | 'url' | 'textarea' | 'select'
  required: boolean
  options?: string[]
}

// ── PROJECT ──
export type ProjectType = 'customer' | 'internal'
export type ProjectStatus = 'available' | 'in_progress' | 'completed' | 'cancelled'

export interface IProject {
  _id: string
  type: ProjectType
  orderId?: string
  customerId?: string
  assignedTo?: string
  templateId: string
  title: string
  status: ProjectStatus
  tasks: ITask[]
  commissionRate: number
  createdAt: Date
}

export interface ITask {
  _id: string
  templateTaskId: string
  title: string
  status: 'pending' | 'in_progress' | 'completed'
  assignedTo?: string
  fieldValues: Record<string, unknown>
  completedAt?: Date
}

// ── NOTIFICATION ──
export type NotificationChannel = 'sms' | 'internal' | 'email'

export interface INotification {
  _id: string
  userId: string
  title: string
  content: string
  isRead: boolean
  type: 'system' | 'order' | 'ticket' | 'project' | 'payment' | 'broadcast'
  relatedId?: string
  createdAt: Date
}

// ── API RESPONSE ──
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ── PAGINATION ──
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
