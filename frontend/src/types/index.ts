export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';

export interface FollowUpNote {
  id: string;
  customerId: string;
  note: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    role: Role;
  };
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followUpNotes?: FollowUpNote[];
  challans?: Array<{
    id: string;
    challanNumber: string;
    status: ChallanStatus;
    totalQuantity: number;
    createdAt: string;
  }>;
  _count?: {
    followUpNotes: number;
    challans: number;
  };
}

export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    role: Role;
  };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
  stockMovements?: StockMovement[];
  _count?: {
    stockMovements: number;
  };
}

export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  quantity: number;
  productName: string;
  sku: string;
  unitPrice: number;
  product?: Partial<Product>;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    businessName: string;
    mobile: string;
    email?: string;
    address?: string;
    gstNumber?: string;
  };
  status: ChallanStatus;
  totalQuantity: number;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    role: Role;
  };
  createdAt: string;
  updatedAt: string;
  items: ChallanItem[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    message: string;
    details?: any;
  } | null;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
