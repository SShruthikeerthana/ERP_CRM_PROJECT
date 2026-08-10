import { prisma } from '../config/db';
import { NotFoundError, ConflictError } from '../utils/errors';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}

export class ProductService {
  static async getProducts(params: ProductQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (params.category) {
      whereClause.category = params.category;
    }

    if (params.search && params.search.trim() !== '') {
      const searchTerm = params.search.trim();
      whereClause.OR = [
        { name: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
        { category: { contains: searchTerm } },
      ];
    }

    const allProducts = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { stockMovements: true },
        },
      },
    });

    // Annotate products with low-stock status
    let annotated = allProducts.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minStockAlert,
    }));

    if (params.lowStockOnly) {
      annotated = annotated.filter((p) => p.isLowStock);
    }

    const total = annotated.length;
    const paginatedItems = annotated.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    return {
      ...product,
      isLowStock: product.currentStock <= product.minStockAlert,
    };
  }

  static async createProduct(data: any) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new ConflictError(`Product SKU '${data.sku}' already exists`);
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        unitPrice: data.unitPrice,
        currentStock: data.currentStock || 0,
        minStockAlert: data.minStockAlert || 0,
        location: data.location,
      },
    });

    return {
      ...product,
      isLowStock: product.currentStock <= product.minStockAlert,
    };
  }

  static async updateProduct(id: string, data: any) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuCheck = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuCheck) {
        throw new ConflictError(`Product SKU '${data.sku}' is already taken`);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
        ...(data.minStockAlert !== undefined && { minStockAlert: data.minStockAlert }),
        ...(data.location !== undefined && { location: data.location }),
      },
    });

    return {
      ...updated,
      isLowStock: updated.currentStock <= updated.minStockAlert,
    };
  }

  static async recordStockMovement(
    productId: string,
    quantityChanged: number,
    movementType: 'IN' | 'OUT',
    reason: string,
    userId: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundError(`Product with ID '${productId}' not found`);
      }

      let newStock = product.currentStock;
      if (movementType === 'IN') {
        newStock += quantityChanged;
      } else {
        if (product.currentStock - quantityChanged < 0) {
          throw new ConflictError(
            `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Requested: ${quantityChanged}, Available: ${product.currentStock}`,
            {
              productId,
              sku: product.sku,
              requested: quantityChanged,
              available: product.currentStock,
            }
          );
        }
        newStock -= quantityChanged;
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantityChanged,
          movementType,
          reason,
          createdById: userId,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return {
        movement,
        product: {
          ...updatedProduct,
          isLowStock: updatedProduct.currentStock <= updatedProduct.minStockAlert,
        },
      };
    });
  }

  static async getStockMovements(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundError(`Product with ID '${productId}' not found`);
    }

    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return movements;
  }
}
