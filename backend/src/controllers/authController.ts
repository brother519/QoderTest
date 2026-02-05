import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig, JwtPayload, TokenPair } from '../config/jwt';
import * as UserModel from '../models/User';
import { AuthenticatedRequest } from '../types/express.d';
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validators';
import { BadRequestError, UnauthorizedError, ConflictError } from '../middlewares/errorHandler';

function generateTokens(user: { id: number; email: string; role: string }): TokenPair {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
}

export async function register(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { email, password, username } = req.body;

  // Validate input
  if (!email || !password || !username) {
    throw new BadRequestError('Email, password, and username are required');
  }

  if (!isValidEmail(email)) {
    throw new BadRequestError('Invalid email format');
  }

  if (!isValidPassword(password)) {
    throw new BadRequestError(
      'Password must be at least 8 characters with uppercase, lowercase, and number'
    );
  }

  if (!isValidUsername(username)) {
    throw new BadRequestError(
      'Username must be 3-30 characters with only letters, numbers, and underscores'
    );
  }

  // Check for existing user
  if (await UserModel.emailExists(email)) {
    throw new ConflictError('Email already registered');
  }

  if (await UserModel.usernameExists(username)) {
    throw new ConflictError('Username already taken');
  }

  // Create user
  const user = await UserModel.createUser({ email, password, username });

  // Generate tokens
  const tokens = generateTokens(user);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      ...tokens,
    },
  });
}

export async function login(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  const user = await UserModel.findUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.is_active) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const isValid = await UserModel.verifyPassword(user, password);

  if (!isValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const tokens = generateTokens(user);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      ...tokens,
    },
  });
}

export async function refresh(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestError('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as JwtPayload;

    const user = await UserModel.findUserById(decoded.userId);

    if (!user || !user.is_active) {
      throw new UnauthorizedError('User not found or inactive');
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token expired');
    }
    throw new UnauthorizedError('Invalid refresh token');
  }
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }

  const user = await UserModel.findUserById(req.user.userId);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
    },
  });
}

export async function logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
  // For JWT, logout is handled on client side by removing the token
  // Optionally, you could implement a token blacklist here using Redis
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}
