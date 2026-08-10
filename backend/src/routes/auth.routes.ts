import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { loginSchema } from '../validators/auth.validator';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', verifyToken, AuthController.getMe);

export default router;
