import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters'),
    mobile: z.string().min(8, 'Mobile number must be at least 8 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    businessName: z.string().min(2, 'Business name is required'),
    gstNumber: z.string().optional().or(z.literal('')),
    customerType: z.enum(['Retail', 'Wholesale', 'Distributor'], {
      errorMap: () => ({ message: 'Type must be Retail, Wholesale, or Distributor' }),
    }),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    status: z.enum(['Lead', 'Active', 'Inactive']).default('Lead'),
    followUpDate: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    mobile: z.string().min(8).optional(),
    email: z.string().email().optional().or(z.literal('')),
    businessName: z.string().min(2).optional(),
    gstNumber: z.string().optional().or(z.literal('')),
    customerType: z.enum(['Retail', 'Wholesale', 'Distributor']).optional(),
    address: z.string().min(5).optional(),
    status: z.enum(['Lead', 'Active', 'Inactive']).optional(),
    followUpDate: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  }),
});

export const createNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
  body: z.object({
    note: z.string().min(3, 'Follow-up note must be at least 3 characters'),
  }),
});

export const queryCustomerSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(['Lead', 'Active', 'Inactive']).optional(),
    customerType: z.enum(['Retail', 'Wholesale', 'Distributor']).optional(),
  }),
});
