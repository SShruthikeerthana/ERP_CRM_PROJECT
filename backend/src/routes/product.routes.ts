import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createProductSchema,
  updateProductSchema,
  createStockMovementSchema,
  queryProductSchema,
} from '../validators/product.validator';
import { ROLES } from '../constants/roles';

const router = Router();

// All roles can view products and movement histories
router.get(
  '/',
  verifyToken,
  validateRequest(queryProductSchema),
  ProductController.getProducts
);

router.get('/:id', verifyToken, ProductController.getProductById);

router.get('/:id/stock-movements', verifyToken, ProductController.getStockMovements);

// Only Admin and Warehouse can create/edit products and record stock movements
router.post(
  '/',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.WAREHOUSE),
  validateRequest(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.WAREHOUSE),
  validateRequest(updateProductSchema),
  ProductController.updateProduct
);

router.post(
  '/:id/stock-movements',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.WAREHOUSE),
  validateRequest(createStockMovementSchema),
  ProductController.recordStockMovement
);

export default router;
