import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createChallanSchema,
  updateChallanSchema,
  queryChallanSchema,
} from '../validators/challan.validator';
import { ROLES } from '../constants/roles';

const router = Router();

// All roles can view sales challans
router.get(
  '/',
  verifyToken,
  validateRequest(queryChallanSchema),
  ChallanController.getChallans
);

router.get('/:id', verifyToken, ChallanController.getChallanById);

// Only Admin and Sales can create, edit, confirm, or cancel sales challans
router.post(
  '/',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.SALES),
  validateRequest(createChallanSchema),
  ChallanController.createChallan
);

router.put(
  '/:id',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.SALES),
  validateRequest(updateChallanSchema),
  ChallanController.updateChallan
);

router.post(
  '/:id/confirm',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.SALES),
  ChallanController.confirmChallan
);

router.post(
  '/:id/cancel',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.SALES),
  ChallanController.cancelChallan
);

export default router;
