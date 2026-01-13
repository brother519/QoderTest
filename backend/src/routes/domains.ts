import { Router } from 'express';
import * as domainController from '../controllers/domainController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// All domain routes require authentication
router.use(authMiddleware);

router.post('/', domainController.createDomain);
router.get('/', domainController.getDomains);
router.post('/:id/verify', domainController.verifyDomain);
router.delete('/:id', domainController.deleteDomain);

export default router;
