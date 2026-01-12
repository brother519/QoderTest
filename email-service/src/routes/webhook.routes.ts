import { Router } from 'express';
import { webhookController } from '../controllers/index.js';

const router = Router();

// POST /api/v1/webhooks/sendgrid - SendGrid webhook
router.post('/sendgrid', (req, res) => {
  webhookController.handleSendGrid(req, res);
});

// POST /api/v1/webhooks/aws-ses - AWS SES webhook
router.post('/aws-ses', (req, res) => {
  webhookController.handleAWSSES(req, res);
});

export default router;
