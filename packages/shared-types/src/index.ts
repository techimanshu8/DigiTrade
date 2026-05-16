// Shared authentication types
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Shared user types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  role: 'USER' | 'ADMIN' | 'SUPPORT';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  documentVerified: boolean;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

// Shared beneficiary types
export interface Beneficiary {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  country: string;
  bankCode?: string;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CURRENT';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

// Shared transaction types
export interface Quote {
  id: string;
  userId: string;
  sourceAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
  targetAmount: number;
  rate: number;
  fee: number;
  expiresAt: Date;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  beneficiaryId: string;
  quoteId: string;
  sourceAmount: number;
  sourceCurrency: string;
  targetAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  fee: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shared compliance types
export interface KycDocument {
  id: string;
  userId: string;
  documentType: 'PASSPORT' | 'DRIVER_LICENSE' | 'NATIONAL_ID' | 'VISA';
  documentNumber: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Shared API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Kafka event types
export interface KafkaEvent<T = unknown> {
  id: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: T;
  timestamp: Date;
  version: number;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
  subject?: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum DocumentType {
  PASSPORT = 'PASSPORT',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  NATIONAL_ID = 'NATIONAL_ID',
  VISA = 'VISA',
}
