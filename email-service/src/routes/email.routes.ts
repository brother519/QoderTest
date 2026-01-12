import { Router } from 'express';
import { emailController, sendEmailSchema, sendBatchSchema } from '../controllers/index.js';
import { validateBody } from '../middleware/index.js';

const router = Router();

// POST /api/v1/emails/send - 发送单封邮件
router.post('/send', validateBody(sendEmailSchema), (req, res) => {
  emailController.sendEmail(req, res);
});

// POST /api/v1/emails/send-batch - 发送批量邮件
router.post('/send-batch', validateBody(sendBatchSchema), (req, res) => {
  emailController.sendBatch(req, res);
});

// GET /api/v1/emails/:jobId - 获取邮件状态
router.get('/:jobId', (req, res) => {
  emailController.getJobStatus(req, res);
});

// POST /api/v1/emails/:jobId/cancel - 取消邮件任务
router.post('/:jobId/cancel', (req, res) => {
  emailController.cancelJob(req, res);
});

export default router;
