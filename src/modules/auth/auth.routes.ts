import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authController } from './auth.controller';
import { authenticate } from './auth.middleware';
import {
  authRateLimiter,
  registerRateLimiter,
  twoFactorRateLimiter,
} from '../../common/middleware/rate-limiter';
import { config } from '../../config';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateFamilyId,
  getRefreshTokenExpiry,
} from '../../common/utils/token';
import { prisma } from '../../config/database';
import type { AuthenticatedRequest } from '../../common/types/express.d';

import './strategies/google.strategy';
import './strategies/github.strategy';

const router = Router();

router.post('/register', registerRateLimiter, authController.register.bind(authController));

router.post('/login', authRateLimiter, authController.login.bind(authController));

router.post('/logout', authController.logout.bind(authController));

router.post('/logout-all', authenticate, authController.logoutAll.bind(authController));

router.post('/refresh', authController.refresh.bind(authController));

router.post('/2fa/validate', twoFactorRateLimiter, authController.validate2FA.bind(authController));

router.post('/2fa/setup', authenticate, twoFactorRateLimiter, authController.setup2FA.bind(authController));

router.post('/2fa/verify', authenticate, twoFactorRateLimiter, authController.verify2FA.bind(authController));

router.post('/2fa/disable', authenticate, authController.disable2FA.bind(authController));

router.post('/2fa/backup-codes', authenticate, authController.regenerateBackupCodes.bind(authController));

router.get('/me', authenticate, authController.getProfile.bind(authController));

async function handleOAuthCallback(user: any, req: Request, res: Response) {
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: tokenHash,
      familyId: generateFamilyId(),
      expiresAt: getRefreshTokenExpiry(),
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const redirectUrl = new URL(`${config.frontendUrl}/auth/callback`);
  redirectUrl.searchParams.set('accessToken', accessToken);
  redirectUrl.searchParams.set('refreshToken', refreshToken);
  res.redirect(redirectUrl.toString());
}

router.get('/oauth/google', passport.authenticate('google', { session: false }));

router.get(
  '/oauth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${config.frontendUrl}/auth/error` }),
  async (req: Request, res: Response) => {
    await handleOAuthCallback(req.user, req, res);
  }
);

router.get('/oauth/github', passport.authenticate('github', { session: false }));

router.get(
  '/oauth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${config.frontendUrl}/auth/error` }),
  async (req: Request, res: Response) => {
    await handleOAuthCallback(req.user, req, res);
  }
);

export default router;
