import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    sku: z.string().min(2, 'SKU is required').transform((val) => val.toUpperCase().trim()),
    category: z.string().min(2, 'Category is required'),
    unitPrice: z.number().positive('Unit price must be a positive number'),
    currentStock: z.number().int().min(0, 'Current stock cannot be negative').default(0),
    minStockAlert: z.number().int().min(0, 'Minimum stock alert cannot be negative').default(0),
    location: z.string().min(2, 'Warehouse location is required'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    sku: z.string().min(2).transform((val) => val.toUpperCase().trim()).optional(),
    category: z.string().min(2).optional(),
    unitPrice: z.number().positive().optional(),
    minStockAlert: z.number().int().min(0).optional(),
    location: z.string().min(2).optional(),
  }),
});

export const createStockMovementSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    quantityChanged: z.number().int().positive('Quantity changed must be a positive integer greater than 0'),
    movementType: z.enum(['IN', 'OUT'], {
      errorMap: () => ({ message: 'Movement type must be IN or OUT' }),
    }),
    reason: z.string().min(3, 'Reason is required and must be at least 3 characters'),
  }),
});

export const queryProductSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    lowStockOnly: z.string().optional(),
  }),
});
