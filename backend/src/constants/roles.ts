export const ROLES = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTS: 'ACCOUNTS',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

export const CUSTOMER_TYPES = ['Retail', 'Wholesale', 'Distributor'] as const;
export const CUSTOMER_STATUSES = ['Lead', 'Active', 'Inactive'] as const;
export const MOVEMENT_TYPES = ['IN', 'OUT'] as const;
export const CHALLAN_STATUSES = ['Draft', 'Confirmed', 'Cancelled'] as const;
