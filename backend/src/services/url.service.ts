import { prisma } from '../config/database.js';
import { getCached, setCache, deleteCache } from '../config/redis.js';
import { env, CACHE_TTL } from '../config/index.js';
import { generateUniqueCode } from '../utils/base62.js';
import { generateQrCode, deleteQrCode } from './qrcode.service.js';
import { AppError } from '../middleware/error.js';
import type { 
  CreateUrlRequest, 
  UrlResponse, 
  UpdateUrlRequest,
  PaginatedResponse 
} from '../types/index.js';

interface CachedUrl {
  longUrl: string;
  expiresAt: string | null;
  isActive: boolean;
}

function buildShortUrl(shortCode: string, domainId?: string | null): string {
  // TODO: Implement custom domain support
  return `${env.shortUrlBase}/${shortCode}`;
}

function buildQrCodeUrl(id: string): string {
  return `${env.apiBaseUrl}/urls/${id}/qr`;
}

function formatUrlResponse(url: {
  id: string;
  shortCode: string;
  longUrl: string;
  domainId: string | null;
  title: string | null;
  qrCodePath: string | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}, totalClicks?: number): UrlResponse {
  return {
    id: url.id,
    shortUrl: buildShortUrl(url.shortCode, url.domainId),
    shortCode: url.shortCode,
    longUrl: url.longUrl,
    title: url.title ?? undefined,
    qrCodeUrl: url.qrCodePath ? buildQrCodeUrl(url.id) : undefined,
    isActive: url.isActive,
    expiresAt: url.expiresAt?.toISOString(),
    createdAt: url.createdAt.toISOString(),
    updatedAt: url.updatedAt.toISOString(),
    totalClicks,
  };
}

export async function createUrl(
  data: CreateUrlRequest,
  userId: string
): Promise<UrlResponse> {
  // Validate URL format
  try {
    new URL(data.longUrl);
  } catch {
    throw new AppError('Invalid URL format', 400);
  }
  
  // Generate unique short code
  const shortCode = await generateUniqueCode(
    async (code) => {
      const existing = await prisma.url.findFirst({
        where: { 
          shortCode: code,
          domainId: data.domainId ?? null,
        },
      });
      return !!existing;
    },
    data.customCode
  );
  
  // Create URL record
  const url = await prisma.url.create({
    data: {
      shortCode,
      longUrl: data.longUrl,
      customCode: data.customCode,
      domainId: data.domainId,
      userId,
      title: data.title,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  
  // Generate QR code
  const qrCodePath = await generateQrCode(url.id, buildShortUrl(shortCode, data.domainId));
  
  // Update URL with QR code path
  const updatedUrl = await prisma.url.update({
    where: { id: url.id },
    data: { qrCodePath },
  });
  
  // Cache the URL mapping
  const cacheKey = `url:${shortCode}:${data.domainId ?? 'default'}`;
  await setCache<CachedUrl>(cacheKey, {
    longUrl: data.longUrl,
    expiresAt: data.expiresAt ?? null,
    isActive: true,
  }, CACHE_TTL);
  
  return formatUrlResponse(updatedUrl, 0);
}

export async function getUrlByShortCode(
  shortCode: string,
  domainId?: string
): Promise<{ longUrl: string; urlId: string } | null> {
  const cacheKey = `url:${shortCode}:${domainId ?? 'default'}`;
  
  // Check cache first
  const cached = await getCached<CachedUrl & { id?: string }>(cacheKey);
  
  if (cached) {
    // Check expiration
    if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
      return null;
    }
    
    if (!cached.isActive) {
      return null;
    }
    
    // Need to get URL ID from database for click tracking
    const url = await prisma.url.findFirst({
      where: { shortCode, domainId: domainId ?? null },
      select: { id: true },
    });
    
    if (!url) return null;
    
    return { longUrl: cached.longUrl, urlId: url.id };
  }
  
  // Fetch from database
  const url = await prisma.url.findFirst({
    where: { 
      shortCode, 
      domainId: domainId ?? null,
    },
  });
  
  if (!url || !url.isActive) {
    return null;
  }
  
  // Check expiration
  if (url.expiresAt && url.expiresAt < new Date()) {
    return null;
  }
  
  // Cache for next time
  await setCache<CachedUrl>(cacheKey, {
    longUrl: url.longUrl,
    expiresAt: url.expiresAt?.toISOString() ?? null,
    isActive: url.isActive,
  }, CACHE_TTL);
  
  return { longUrl: url.longUrl, urlId: url.id };
}

export async function getUrlById(
  id: string,
  userId: string
): Promise<UrlResponse | null> {
  const url = await prisma.url.findFirst({
    where: { id, userId },
  });
  
  if (!url) return null;
  
  // Get click count
  const clickCount = await prisma.click.count({
    where: { urlId: id },
  });
  
  return formatUrlResponse(url, clickCount);
}

export async function listUrls(
  userId: string,
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<PaginatedResponse<UrlResponse>> {
  const skip = (page - 1) * limit;
  
  const where = {
    userId,
    isActive: true,
    ...(search && {
      OR: [
        { longUrl: { contains: search, mode: 'insensitive' as const } },
        { shortCode: { contains: search, mode: 'insensitive' as const } },
        { title: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };
  
  const [urls, total] = await Promise.all([
    prisma.url.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.url.count({ where }),
  ]);
  
  // Get click counts for all URLs
  const urlIds = urls.map(u => u.id);
  const clickCounts = await prisma.click.groupBy({
    by: ['urlId'],
    where: { urlId: { in: urlIds } },
    _count: { id: true },
  });
  
  const clickCountMap = new Map(
    clickCounts.map(c => [c.urlId, c._count.id])
  );
  
  return {
    data: urls.map(url => formatUrlResponse(url, clickCountMap.get(url.id) ?? 0)),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function updateUrl(
  id: string,
  userId: string,
  data: UpdateUrlRequest
): Promise<UrlResponse | null> {
  const existing = await prisma.url.findFirst({
    where: { id, userId },
  });
  
  if (!existing) return null;
  
  // Validate new URL if provided
  if (data.longUrl) {
    try {
      new URL(data.longUrl);
    } catch {
      throw new AppError('Invalid URL format', 400);
    }
  }
  
  const updated = await prisma.url.update({
    where: { id },
    data: {
      ...(data.longUrl && { longUrl: data.longUrl }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.expiresAt !== undefined && { 
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null 
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
  
  // Invalidate cache
  const cacheKey = `url:${existing.shortCode}:${existing.domainId ?? 'default'}`;
  await deleteCache(cacheKey);
  
  // Regenerate QR code if long URL changed
  if (data.longUrl && data.longUrl !== existing.longUrl) {
    await deleteQrCode(existing.qrCodePath);
    const qrCodePath = await generateQrCode(id, buildShortUrl(updated.shortCode, updated.domainId));
    await prisma.url.update({
      where: { id },
      data: { qrCodePath },
    });
  }
  
  const clickCount = await prisma.click.count({
    where: { urlId: id },
  });
  
  return formatUrlResponse(updated, clickCount);
}

export async function deleteUrl(id: string, userId: string): Promise<boolean> {
  const existing = await prisma.url.findFirst({
    where: { id, userId },
  });
  
  if (!existing) return false;
  
  // Soft delete
  await prisma.url.update({
    where: { id },
    data: { isActive: false },
  });
  
  // Invalidate cache
  const cacheKey = `url:${existing.shortCode}:${existing.domainId ?? 'default'}`;
  await deleteCache(cacheKey);
  
  return true;
}
