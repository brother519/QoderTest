import { prisma } from '../../config/database';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../../common/utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateFamilyId,
  getRefreshTokenExpiry,
  generateTempToken,
  verifyTempToken,
} from '../../common/utils/token';
import {
  generateTotpSecret,
  verifyTotpCode,
  generateQrCodeUrl,
  formatSecretForManualEntry,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from '../../common/utils/totp';
import { createError } from '../../common/middleware/error-handler';
import type { RegisterInput, LoginInput } from './auth.validators';

export class AuthService {
  async register(input: RegisterInput) {
    const { email, password, name } = input;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw createError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw createError(passwordValidation.message!, 400, 'WEAK_PASSWORD');
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return { user };
  }

  async login(input: LoginInput, deviceInfo?: string, ipAddress?: string) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { user2fa: true },
    });

    if (!user || !user.passwordHash) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw createError('Account is disabled', 403, 'ACCOUNT_DISABLED');
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (user.user2fa?.isEnabled) {
      const tempToken = generateTempToken(user.id);
      return {
        requires2FA: true,
        tempToken,
        message: 'Please enter your 2FA code',
      };
    }

    return this.generateTokensForUser(user.id, user.email, deviceInfo, ipAddress);
  }

  async validate2FA(tempToken: string, code: string, deviceInfo?: string, ipAddress?: string) {
    const decoded = verifyTempToken(tempToken);
    if (!decoded) {
      throw createError('Invalid or expired temp token', 401, 'INVALID_TEMP_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { user2fa: true },
    });

    if (!user || !user.user2fa) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isValidCode = verifyTotpCode(user.user2fa.secret, code);
    
    if (!isValidCode && user.user2fa.backupCodes) {
      const backupCodes = JSON.parse(user.user2fa.backupCodes) as string[];
      const usedIndex = verifyBackupCode(code, backupCodes);
      
      if (usedIndex >= 0) {
        backupCodes.splice(usedIndex, 1);
        await prisma.user2FA.update({
          where: { userId: user.id },
          data: { backupCodes: JSON.stringify(backupCodes) },
        });
      } else {
        throw createError('Invalid 2FA code', 401, 'INVALID_2FA_CODE');
      }
    } else if (!isValidCode) {
      throw createError('Invalid 2FA code', 401, 'INVALID_2FA_CODE');
    }

    return this.generateTokensForUser(user.id, user.email, deviceInfo, ipAddress);
  }

  async refreshToken(refreshToken: string, deviceInfo?: string, ipAddress?: string) {
    const tokenHash = hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    if (storedToken.isRevoked) {
      await prisma.refreshToken.updateMany({
        where: { familyId: storedToken.familyId },
        data: { isRevoked: true },
      });
      throw createError('Token reuse detected, all sessions revoked', 401, 'TOKEN_REUSE_DETECTED');
    }

    if (storedToken.expiresAt < new Date()) {
      throw createError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashToken(newRefreshToken);

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        token: newTokenHash,
        familyId: storedToken.familyId,
        expiresAt: getRefreshTokenExpiry(),
        deviceInfo,
        ipAddress,
      },
    });

    const accessToken = generateAccessToken(storedToken.user.id, storedToken.user.email);

    await prisma.user.update({
      where: { id: storedToken.userId },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    await prisma.refreshToken.updateMany({
      where: { token: tokenHash },
      data: { isRevoked: true },
    });

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Logged out from all devices' };
  }

  async setup2FA(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { user2fa: true },
    });

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.user2fa?.isEnabled) {
      throw createError('2FA is already enabled', 400, '2FA_ALREADY_ENABLED');
    }

    const secret = generateTotpSecret();
    const qrCodeUrl = await generateQrCodeUrl(user.email, secret);
    const manualEntryKey = formatSecretForManualEntry(secret);

    await prisma.user2FA.upsert({
      where: { userId },
      update: { secret, isEnabled: false },
      create: { userId, secret, isEnabled: false },
    });

    return { secret, qrCodeUrl, manualEntryKey };
  }

  async verify2FA(userId: string, code: string) {
    const user2fa = await prisma.user2FA.findUnique({ where: { userId } });

    if (!user2fa) {
      throw createError('2FA not set up', 400, '2FA_NOT_SETUP');
    }

    if (user2fa.isEnabled) {
      throw createError('2FA is already enabled', 400, '2FA_ALREADY_ENABLED');
    }

    const isValid = verifyTotpCode(user2fa.secret, code);
    if (!isValid) {
      throw createError('Invalid verification code', 400, 'INVALID_CODE');
    }

    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    await prisma.user2FA.update({
      where: { userId },
      data: {
        isEnabled: true,
        verifiedAt: new Date(),
        backupCodes: JSON.stringify(hashedBackupCodes),
      },
    });

    return { message: '2FA enabled successfully', backupCodes };
  }

  async disable2FA(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { user2fa: true },
    });

    if (!user || !user.passwordHash) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw createError('Invalid password', 401, 'INVALID_PASSWORD');
    }

    if (!user.user2fa?.isEnabled) {
      throw createError('2FA is not enabled', 400, '2FA_NOT_ENABLED');
    }

    await prisma.user2FA.delete({ where: { userId } });

    return { message: '2FA disabled successfully' };
  }

  async regenerateBackupCodes(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { user2fa: true },
    });

    if (!user || !user.passwordHash) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw createError('Invalid password', 401, 'INVALID_PASSWORD');
    }

    if (!user.user2fa?.isEnabled) {
      throw createError('2FA is not enabled', 400, '2FA_NOT_ENABLED');
    }

    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    await prisma.user2FA.update({
      where: { userId },
      data: { backupCodes: JSON.stringify(hashedBackupCodes) },
    });

    return { backupCodes };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        user2fa: { select: { isEnabled: true } },
        oauthAccounts: { select: { provider: true } },
      },
    });

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      ...user,
      has2FA: user.user2fa?.isEnabled || false,
      linkedProviders: user.oauthAccounts.map(a => a.provider),
    };
  }

  async findOrCreateOAuthUser(
    provider: string,
    providerAccountId: string,
    email: string,
    name?: string,
    avatar?: string,
    accessToken?: string
  ) {
    let oauthAccount = await prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true },
    });

    if (oauthAccount) {
      if (accessToken) {
        await prisma.oAuthAccount.update({
          where: { id: oauthAccount.id },
          data: { accessToken },
        });
      }
      return oauthAccount.user;
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, avatar, emailVerified: true },
      });
    }

    await prisma.oAuthAccount.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId,
        accessToken,
      },
    });

    return user;
  }

  private async generateTokensForUser(
    userId: string,
    email: string,
    deviceInfo?: string,
    ipAddress?: string
  ) {
    const accessToken = generateAccessToken(userId, email);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        userId,
        token: tokenHash,
        familyId: generateFamilyId(),
        expiresAt: getRefreshTokenExpiry(),
        deviceInfo,
        ipAddress,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user,
    };
  }
}

export const authService = new AuthService();
