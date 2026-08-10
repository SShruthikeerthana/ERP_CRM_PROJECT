import { prisma } from '../config/db';
import { NotFoundError, ConflictError, AppError } from '../utils/errors';

export interface ChallanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
}

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.challan.count();
    const nextSeq = (count + 1).toString().padStart(5, '0');
    return `CH-${year}-${nextSeq}`;
  }

  static async getChallans(params: ChallanQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (params.status) {
      whereClause.status = params.status;
    }

    if (params.customerId) {
      whereClause.customerId = params.customerId;
    }

    if (params.search && params.search.trim() !== '') {
      const searchTerm = params.search.trim();
      whereClause.OR = [
        { challanNumber: { contains: searchTerm } },
        { customer: { name: { contains: searchTerm } } },
        { customer: { businessName: { contains: searchTerm } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.challan.count({ where: whereClause }),
      prisma.challan.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true },
          },
          createdBy: {
            select: { id: true, name: true, role: true },
          },
          items: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, name: true, role: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, currentStock: true, minStockAlert: true },
            },
          },
        },
      },
    });

    if (!challan) {
      throw new NotFoundError(`Challan with ID '${id}' not found`);
    }

    return challan;
  }

  static async createChallan(customerId: string, itemInputs: Array<{ productId: string; quantity: number }>, userId: string) {
    // 1. Verify customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found`);
    }

    // 2. Fetch products and build snapshot items
    let totalQuantity = 0;
    const challanItemsData = [];

    for (const input of itemInputs) {
      const product = await prisma.product.findUnique({ where: { id: input.productId } });
      if (!product) {
        throw new NotFoundError(`Product with ID '${input.productId}' not found`);
      }

      totalQuantity += input.quantity;
      challanItemsData.push({
        productId: product.id,
        quantity: input.quantity,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
      });
    }

    // 3. Generate challan number
    const challanNumber = await this.generateChallanNumber();

    // 4. Save as Draft
    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        status: 'Draft',
        totalQuantity,
        createdById: userId,
        items: {
          create: challanItemsData,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return challan;
  }

  static async updateChallan(id: string, data: { customerId?: string; items?: Array<{ productId: string; quantity: number }> }) {
    const existing = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundError(`Challan with ID '${id}' not found`);
    }

    if (existing.status !== 'Draft') {
      throw new AppError(`Cannot edit a ${existing.status.toLowerCase()} challan. Only Draft challans can be modified.`, 400);
    }

    const updateData: any = {};

    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        throw new NotFoundError(`Customer with ID '${data.customerId}' not found`);
      }
      updateData.customerId = data.customerId;
    }

    if (data.items && data.items.length > 0) {
      // Re-snapshot items & recalculate totalQuantity
      await prisma.challanItem.deleteMany({ where: { challanId: id } });

      let totalQuantity = 0;
      const challanItemsData = [];

      for (const input of data.items) {
        const product = await prisma.product.findUnique({ where: { id: input.productId } });
        if (!product) {
          throw new NotFoundError(`Product with ID '${input.productId}' not found`);
        }

        totalQuantity += input.quantity;
        challanItemsData.push({
          productId: product.id,
          quantity: input.quantity,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
        });
      }

      updateData.totalQuantity = totalQuantity;
      updateData.items = {
        create: challanItemsData,
      };
    }

    const updated = await prisma.challan.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: true,
      },
    });

    return updated;
  }

  static async confirmChallan(id: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw new NotFoundError(`Challan with ID '${id}' not found`);
      }

      if (challan.status !== 'Draft') {
        throw new AppError(`Only Draft challans can be confirmed. Current status: '${challan.status}'`, 400);
      }

      // Check live stock for all items
      const shortItems: Array<{ sku: string; name: string; requested: number; available: number }> = [];

      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        const availableStock = product ? product.currentStock : 0;

        if (!product || availableStock < item.quantity) {
          shortItems.push({
            sku: item.sku,
            name: item.productName,
            requested: item.quantity,
            available: availableStock,
          });
        }
      }

      // Reject confirmation if ANY item has insufficient stock
      if (shortItems.length > 0) {
        throw new ConflictError(
          'Confirmation failed: Insufficient stock available for one or more requested products',
          { shortItems }
        );
      }

      // Deduct stock for each product and record OUT stock movement
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan ${challan.challanNumber}`,
            createdById: userId,
          },
        });
      }

      // Update status to Confirmed
      const confirmed = await tx.challan.update({
        where: { id },
        data: { status: 'Confirmed' },
        include: {
          customer: true,
          items: true,
        },
      });

      return confirmed;
    });
  }

  static async cancelChallan(id: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw new NotFoundError(`Challan with ID '${id}' not found`);
      }

      if (challan.status === 'Cancelled') {
        throw new AppError('Challan is already cancelled', 400);
      }

      // If Confirmed, restore stock & record IN stock movements
      if (challan.status === 'Confirmed') {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: 'IN',
              reason: `Challan ${challan.challanNumber} cancelled`,
              createdById: userId,
            },
          });
        }
      }

      const cancelled = await tx.challan.update({
        where: { id },
        data: { status: 'Cancelled' },
        include: {
          customer: true,
          items: true,
        },
      });

      return cancelled;
    });
  }
}
