import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { sendSuccess } from '../utils/response';

export class ChallanController {
  static async getChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;

      const result = await ChallanService.getChallans({
        page,
        limit,
        search,
        status,
        customerId,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.getChallanById(id);
      return sendSuccess(res, challan, 200);
    } catch (error) {
      next(error);
    }
  }

  static async createChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, items } = req.body;
      const userId = req.user!.id;
      const challan = await ChallanService.createChallan(customerId, items, userId);
      return sendSuccess(res, challan, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ChallanService.updateChallan(id, req.body);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  static async confirmChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const confirmed = await ChallanService.confirmChallan(id, userId);
      return sendSuccess(res, confirmed, 200);
    } catch (error) {
      next(error);
    }
  }

  static async cancelChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const cancelled = await ChallanService.cancelChallan(id, userId);
      return sendSuccess(res, cancelled, 200);
    } catch (error) {
      next(error);
    }
  }
}
