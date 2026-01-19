import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimit';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
