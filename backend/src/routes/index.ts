import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import challanRoutes from './challan.routes';
import { HealthController } from '../controllers/health.controller';

const router = Router();

// Health check endpoint
router.get('/health', HealthController.check);

// Mount domain routes under /api/v1
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/challans', challanRoutes);

export default router;
