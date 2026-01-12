import { Response } from 'express';
import * as LinkModel from '../models/Link';
import { generateShortCode, reserveCustomCode } from '../services/shortCodeService';
import { AuthenticatedRequest } from '../types/express.d';
import { isValidUrl, sanitizeUrl, isValidShortCode } from '../utils/validators';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middlewares/errorHandler';
import { appConfig } from '../config/app';

export async function createLink(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const { original_url, custom_code, title, description, expires_at } = req.body;

  if (!original_url) {
    throw new BadRequestError('Original URL is required');
  }

  // Validate and sanitize URL
  if (!isValidUrl(original_url)) {
    throw new BadRequestError('Invalid URL format');
  }

  const sanitizedUrl = sanitizeUrl(original_url);

  // Determine short code
  let shortCode: string;

  if (custom_code) {
    const validation = await reserveCustomCode(custom_code);
    if (!validation.success) {
      throw new BadRequestError(validation.error || 'Invalid custom code');
    }
    shortCode = custom_code;
  } else {
    shortCode = await generateShortCode();
  }

  // Validate expires_at if provided
  let expiresAt: Date | undefined;
  if (expires_at) {
    expiresAt = new Date(expires_at);
    if (isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      throw new BadRequestError('Expiration date must be in the future');
    }
  }

  // Create link
  const link = await LinkModel.createLink(
    req.user.userId,
    {
      original_url: sanitizedUrl,
      custom_code,
      title,
      description,
      expires_at: expiresAt,
    },
    shortCode
  );

  res.status(201).json({
    success: true,
    data: {
      ...link,
      short_url: `${appConfig.baseUrl}/${link.short_code}`,
    },
  });
}

export async function getLinks(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

  const { links, total } = await LinkModel.findLinksByUserId(req.user.userId, page, limit);

  const linksWithUrls = links.map(link => ({
    ...link,
    short_url: `${appConfig.baseUrl}/${link.short_code}`,
  }));

  res.json({
    success: true,
    data: {
      items: linksWithUrls,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  });
}

export async function getLink(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const linkId = parseInt(req.params.id, 10);

  if (isNaN(linkId)) {
    throw new BadRequestError('Invalid link ID');
  }

  const link = await LinkModel.findLinkById(linkId);

  if (!link) {
    throw new NotFoundError('Link not found');
  }

  if (link.user_id !== req.user.userId) {
    throw new ForbiddenError('Access denied');
  }

  res.json({
    success: true,
    data: {
      ...link,
      short_url: `${appConfig.baseUrl}/${link.short_code}`,
    },
  });
}

export async function updateLink(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const linkId = parseInt(req.params.id, 10);

  if (isNaN(linkId)) {
    throw new BadRequestError('Invalid link ID');
  }

  const { title, description, expires_at, is_active } = req.body;

  // Validate expires_at if provided
  let expiresAt: Date | null | undefined;
  if (expires_at !== undefined) {
    if (expires_at === null) {
      expiresAt = null;
    } else {
      expiresAt = new Date(expires_at);
      if (isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
        throw new BadRequestError('Expiration date must be in the future');
      }
    }
  }

  const link = await LinkModel.updateLink(linkId, req.user.userId, {
    title,
    description,
    expires_at: expiresAt,
    is_active,
  });

  if (!link) {
    throw new NotFoundError('Link not found or access denied');
  }

  res.json({
    success: true,
    data: {
      ...link,
      short_url: `${appConfig.baseUrl}/${link.short_code}`,
    },
  });
}

export async function deleteLink(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const linkId = parseInt(req.params.id, 10);

  if (isNaN(linkId)) {
    throw new BadRequestError('Invalid link ID');
  }

  const deleted = await LinkModel.deleteLink(linkId, req.user.userId);

  if (!deleted) {
    throw new NotFoundError('Link not found or access denied');
  }

  res.json({
    success: true,
    message: 'Link deleted successfully',
  });
}
