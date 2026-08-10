import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess } from '../utils/response';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const customerType = req.query.customerType as string;

      const result = await CustomerService.getCustomers({
        page,
        limit,
        search,
        status,
        customerType,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);
      return sendSuccess(res, customer, 200);
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      return sendSuccess(res, customer, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await CustomerService.updateCustomer(id, req.body);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  static async addFollowUpNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const userId = req.user!.id;
      const newNote = await CustomerService.addFollowUpNote(id, note, userId);
      return sendSuccess(res, newNote, 201);
    } catch (error) {
      next(error);
    }
  }
}
