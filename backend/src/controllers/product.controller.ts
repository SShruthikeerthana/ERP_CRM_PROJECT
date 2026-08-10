import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess } from '../utils/response';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const lowStockOnly = req.query.lowStockOnly === 'true';

      const result = await ProductService.getProducts({
        page,
        limit,
        search,
        category,
        lowStockOnly,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      return sendSuccess(res, product, 200);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body);
      return sendSuccess(res, product, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ProductService.updateProduct(id, req.body);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  static async recordStockMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantityChanged, movementType, reason } = req.body;
      const userId = req.user!.id;

      const result = await ProductService.recordStockMovement(
        id,
        quantityChanged,
        movementType,
        reason,
        userId
      );

      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getStockMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const movements = await ProductService.getStockMovements(id);
      return sendSuccess(res, movements, 200);
    } catch (error) {
      next(error);
    }
  }
}
