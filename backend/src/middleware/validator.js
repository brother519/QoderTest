const Joi = require('joi');
const { AppError } = require('./errorHandler');

const articleSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': '标题不能为空',
    'string.max': '标题不能超过200个字符',
    'any.required': '标题是必填项'
  }),
  content: Joi.string().min(1).required().messages({
    'string.empty': '内容不能为空',
    'any.required': '内容是必填项'
  }),
  author: Joi.string().max(100).optional().messages({
    'string.max': '作者名称不能超过100个字符'
  }),
  status: Joi.string().valid('draft', 'published').optional().messages({
    'any.only': '状态只能是 draft 或 published'
  })
});

function validateArticle(req, res, next) {
  const { error } = articleSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    throw new AppError(message, 400, 'VALIDATION_ERROR');
  }

  next();
}

module.exports = {
  validateArticle
};
