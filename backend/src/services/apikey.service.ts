import { prisma } from '../config/database.js';
import { generateApiKey, hashString } from '../utils/base62.js';
import { AppError } from '../middleware/error.js';
import type { CreateApiKeyRequest, ApiKeyResponse } from '../types/index.js';

function formatApiKeyResponse(apiKey: {
  id: string;
  keyPrefix: string;
  name: string;
  scopes: unknown;
  rateLimit: number;
  lastUsedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}): ApiKeyResponse {
  return {
    id: apiKey.id,
    keyPrefix: apiKey.keyPrefix,
    name: apiKey.name,
    scopes: apiKey.scopes as string[],
    rateLimit: apiKey.rateLimit,
    lastUsedAt: apiKey.lastUsedAt?.toISOString(),
    isActive: apiKey.isActive,
    createdAt: apiKey.createdAt.toISOString(),
    expiresAt: apiKey.expiresAt?.toISOString(),
  };
}

export async function createApiKey(
  data: CreateApiKeyRequest,
  userId: string
): Promise<{ apiKey: ApiKeyResponse; key: string }> {
  const { key, hash, prefix } = generateApiKey();
  
  const defaultScopes = ['url:create', 'url:read', 'url:update', 'url:delete', 'analytics:read'];
  
  const apiKey = await prisma.apiKey.create({
    data: {
      keyHash: hash,
      keyPrefix: prefix,
      name: data.name,
      userId,
      scopes: data.scopes ?? defaultScopes,
      rateLimit: data.rateLimit ?? 1000,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  
  return {
    apiKey: formatApiKeyResponse(apiKey),
    key, // Only returned on creation
  };
}

export async function listApiKeys(userId: string): Promise<ApiKeyResponse[]> {
  const apiKeys = await prisma.apiKey.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  
  return apiKeys.map(formatApiKeyResponse);
}

export async function revokeApiKey(id: string, userId: string): Promise<boolean> {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id, userId },
  });
  
  if (!apiKey) return false;
  
  await prisma.apiKey.update({
    where: { id },
    data: { isActive: false },
  });
  
  return true;
}

// Bootstrap function to create initial API key for development
export async function bootstrapApiKey(userId: string = 'dev-user'): Promise<string | null> {
  // Check if any API key exists for this user
  const existing = await prisma.apiKey.findFirst({
    where: { userId, isActive: true },
  });
  
  if (existing) {
    return null; // Already has a key
  }
  
  const { key } = await createApiKey(
    { name: 'Development Key' },
    userId
  );
  
  return key;
}
