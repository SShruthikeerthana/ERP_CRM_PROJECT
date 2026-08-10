import { z } from 'zod';

const challanItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    items: z.array(challanItemInputSchema).min(1, 'Challan must contain at least one item'),
  }),
});

export const updateChallanSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Challan ID is required'),
  }),
  body: z.object({
    customerId: z.string().optional(),
    items: z.array(challanItemInputSchema).min(1, 'Challan must contain at least one item').optional(),
  }),
});

export const queryChallanSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(['Draft', 'Confirmed', 'Cancelled']).optional(),
    customerId: z.string().optional(),
  }),
});
