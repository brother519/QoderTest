import { Router } from 'express';
import * as redirectController from '../controllers/redirectController';
import { redirectLimiter } from '../middlewares/rateLimit';

const router = Router();

// Preview endpoint (shows link info without redirecting)
router.get('/:shortCode/preview', redirectController.preview);

// Main redirect endpoint
router.get('/:shortCode', redirectLimiter, redirectController.redirect);

export default router;
