import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { sendSuccess } from '../utils/response';

export class HealthController {
  static async check(req: Request, res: Response, next: NextFunction) {
    try {
      let dbStatus = 'healthy';
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (err) {
        dbStatus = 'unhealthy';
      }

      const healthData = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: dbStatus,
        service: 'Mini ERP + CRM Operations Portal Backend API',
        version: '1.0.0',
      };

      return sendSuccess(res, healthData, 200);
    } catch (error) {
      next(error);
    }
  }
}
