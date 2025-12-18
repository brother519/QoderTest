import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  twoFactorVerifySchema,
  twoFactorValidateSchema,
} from './auth.validators';
import { createError } from '../../common/middleware/error-handler';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw createError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
      }

      const result = await authService.register(parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw createError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
      }

      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.login(parsed.data, deviceInfo, ipAddress);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async validate2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = twoFactorValidateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw createError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
      }

      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.validate2FA(
        parsed.data.tempToken,
        parsed.data.code,
        deviceInfo,
        ipAddress
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = refreshTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        throw createError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
      }

      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.refreshToken(
        parsed.data.refreshToken,
        deviceInfo,
        ipAddress
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = refreshTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        throw createError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
      }

      const result = await authService.logout(parsed.data.refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw createError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const result = await authService.logoutAll(req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async setup2FA(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw createError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const result = await authService.setup2FA(req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw createError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const parsed = twoFactorVerifySchema.safeParse(req.body);
      if (!parsed.success) {
        throw createError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
      }

      const result = await authService.verify2FA(req.user.id, parsed.data.code);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async disable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw createError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const { password } = req.body;
      if (!password) {
        throw createError('Password is required', 400, 'VALIDATION_ERROR');
      }

      const result = await authService.disable2FA(req.user.id, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async regenerateBackupCodes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw createError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const { password } = req.body;
      if (!password) {
        throw createError('Password is required', 400, 'VALIDATION_ERROR');
      }

      const result = await authService.regenerateBackupCodes(req.user.id, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw createError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const result = await authService.getProfile(req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();