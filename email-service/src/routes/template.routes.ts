import { Router } from 'express';
import {
  templateController,
  createTemplateSchema,
  updateTemplateSchema,
  previewTemplateSchema,
  listTemplatesSchema,
} from '../controllers/index.js';
import { validateBody, validateQuery } from '../middleware/index.js';

const router = Router();

// POST /api/v1/templates - 创建模板
router.post('/', validateBody(createTemplateSchema), (req, res) => {
  templateController.create(req, res);
});

// GET /api/v1/templates - 列出模板
router.get('/', validateQuery(listTemplatesSchema), (req, res) => {
  templateController.list(req, res);
});

// GET /api/v1/templates/:id - 获取单个模板
router.get('/:id', (req, res) => {
  templateController.getById(req, res);
});

// PUT /api/v1/templates/:id - 更新模板
router.put('/:id', validateBody(updateTemplateSchema), (req, res) => {
  templateController.update(req, res);
});

// DELETE /api/v1/templates/:id - 删除模板
router.delete('/:id', (req, res) => {
  templateController.delete(req, res);
});

// POST /api/v1/templates/:id/preview - 预览模板
router.post('/:id/preview', validateBody(previewTemplateSchema), (req, res) => {
  templateController.preview(req, res);
});

export default router;
