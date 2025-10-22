// User session types
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface SessionActivity {
  id: string;
  sessionId: string;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  session?: UserSession;
}

// Authentication request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  company: Company;
  session: UserSession;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}

export interface ProfileResponse {
  user: User;
  company: Company;
  session: UserSession;
  permissions: string[];
}

// Company types
export interface Company {
  id: string;
  name: string;
  legalName?: string;
  taxId?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  companyType: 'chain' | 'independent' | 'franchise';
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiresAt?: string;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  language: string;
  timezone: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  company: Company;
  roles: Role[];
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  slug: string;
  description?: string;
  resource: string;
  action: string;
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
}

// Role types
export interface Role {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

// Warehouse types
export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  code: string;
  type: 'warehouse' | 'restaurant' | 'store' | 'kitchen' | 'other';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  managerId?: string;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  manager?: User;
}

// Product types
export interface Product {
  id: string;
  companyId: string;
  categoryId?: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  unitId: string;
  unitPrice?: number;
  costPrice?: number;
  taxRate: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  productType: 'simple' | 'composite' | 'service';
  isPerishable: boolean;
  shelfLifeDays?: number;
  storageConditions?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  unit: Unit;
}

// Category types
export interface Category {
  id: string;
  companyId: string;
  parentId?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children: Category[];
}

// Unit types
export interface Unit {
  id: string;
  companyId: string;
  name: string;
  abbreviation: string;
  type: 'weight' | 'volume' | 'length' | 'unit' | 'other';
  isBaseUnit: boolean;
  conversionFactor?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Inventory types
export interface Inventory {
  id: string;
  companyId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastCountedAt?: string;
  lastMovementAt?: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
  warehouse: Warehouse;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Navigation types
export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}

// Table types
export interface Column<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (row: T) => boolean;
}