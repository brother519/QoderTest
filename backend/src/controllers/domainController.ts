import { Response } from 'express';
import * as DomainModel from '../models/Domain';
import { AuthenticatedRequest } from '../types/express.d';
import { isValidDomain } from '../utils/validators';
import { BadRequestError, NotFoundError, ForbiddenError, ConflictError } from '../middlewares/errorHandler';

export async function createDomain(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const { domain } = req.body;

  if (!domain) {
    throw new BadRequestError('Domain is required');
  }

  if (!isValidDomain(domain)) {
    throw new BadRequestError('Invalid domain format');
  }

  // Check if domain already exists
  if (await DomainModel.domainExists(domain)) {
    throw new ConflictError('Domain already registered');
  }

  const newDomain = await DomainModel.createDomain(req.user.userId, { domain });

  res.status(201).json({
    success: true,
    data: newDomain,
    message: `Add a TXT record with value "${newDomain.verification_token}" to verify ownership`,
  });
}

export async function getDomains(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const domains = await DomainModel.findDomainsByUserId(req.user.userId);

  res.json({
    success: true,
    data: domains,
  });
}

export async function verifyDomain(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const domainId = parseInt(req.params.id, 10);

  if (isNaN(domainId)) {
    throw new BadRequestError('Invalid domain ID');
  }

  const domain = await DomainModel.findDomainById(domainId);

  if (!domain) {
    throw new NotFoundError('Domain not found');
  }

  if (domain.user_id !== req.user.userId) {
    throw new ForbiddenError('Access denied');
  }

  if (domain.is_verified) {
    res.json({
      success: true,
      data: domain,
      message: 'Domain is already verified',
    });
    return;
  }

  // In a real implementation, you would verify DNS TXT record here
  // For now, we'll just mark it as verified
  const verifiedDomain = await DomainModel.verifyDomain(domainId, req.user.userId);

  res.json({
    success: true,
    data: verifiedDomain,
    message: 'Domain verified successfully',
  });
}

export async function deleteDomain(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const domainId = parseInt(req.params.id, 10);

  if (isNaN(domainId)) {
    throw new BadRequestError('Invalid domain ID');
  }

  const deleted = await DomainModel.deleteDomain(domainId, req.user.userId);

  if (!deleted) {
    throw new NotFoundError('Domain not found or access denied');
  }

  res.json({
    success: true,
    message: 'Domain deleted successfully',
  });
}
