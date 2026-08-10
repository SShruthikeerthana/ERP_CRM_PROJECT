import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createNoteSchema,
  queryCustomerSchema,
} from '../validators/customer.validator';
import { ROLES } from '../constants/roles';

const router = Router();

// All roles can view customer lists and details
router.get(
  '/',
  verifyToken,
  validateRequest(queryCustomerSchema),
  CustomerController.getCustomers
);

router.get('/:id', verifyToken, CustomerController.getCustomerById);

// Only Admin and Sales can create or edit customers
router.post(
  '/',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.SALES),
  validateRequest(createCustomerSchema),
  CustomerController.createCustomer
);

router.put(
  '/:id',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.SALES),
  validateRequest(updateCustomerSchema),
  CustomerController.updateCustomer
);

router.post(
  '/:id/notes',
  verifyToken,
  requireRole(ROLES.ADMIN, ROLES.SALES),
  validateRequest(createNoteSchema),
  CustomerController.addFollowUpNote
);

export default router;
