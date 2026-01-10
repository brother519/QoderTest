import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateCreateUrl = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    url: Joi.string().uri({ scheme: ['http', 'https'] }).required().max(2048)
      .messages({
        'string.uri': 'URL格式无效',
        'string.empty': 'URL不能为空',
        'string.max': 'URL长度不能超过2048个字符',
      }),
    customCode: Joi.string().alphanum().min(2).max(10).optional()
      .messages({
        'string.alphanum': '自定义短代码只能包含字母和数字',
        'string.min': '自定义短代码至少2个字符',
        'string.max': '自定义短代码最多10个字符',
      }),
    expiresIn: Joi.number().integer().positive().optional()
      .messages({
        'number.positive': '过期时间必须为正数',
      }),
    customDomain: Joi.string().domain().optional(),
    title: Joi.string().max(255).optional(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: error.details[0].message,
      },
    });
  }

  next();
};

export const validateUpdateUrl = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    isActive: Joi.boolean().optional(),
    expiresAt: Joi.date().iso().optional(),
  }).min(1);

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: error.details[0].message,
      },
    });
  }

  next();
};
