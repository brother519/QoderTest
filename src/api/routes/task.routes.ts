import { Router } from 'express';
import { transformController } from '../controllers/transform.controller';

const router = Router();

// Get task status
router.get('/:id', (req, res, next) => transformController.getTaskStatus(req, res, next));

export default router;
