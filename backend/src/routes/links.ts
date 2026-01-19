import { Router } from 'express';
import * as linkController from '../controllers/linkController';
import * as qrcodeController from '../controllers/qrcodeController';
import { authMiddleware } from '../middlewares/auth';
import { createLinkLimiter } from '../middlewares/rateLimit';

const router = Router();

// All link management routes require authentication
router.use(authMiddleware);

router.post('/', createLinkLimiter, linkController.createLink);
router.get('/', linkController.getLinks);
router.get('/:id', linkController.getLink);
router.put('/:id', linkController.updateLink);
router.delete('/:id', linkController.deleteLink);
router.get('/:id/qrcode', qrcodeController.getQRCode);

export default router;
