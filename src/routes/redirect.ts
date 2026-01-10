import { Router } from 'express';
import * as redirectController from '../controllers/redirectController';
import { redirectLimiter } from '../middlewares/rateLimit';

const router = Router();

router.get('/:shortCode', redirectLimiter, redirectController.redirect);

export default router;
