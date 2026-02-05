import { Response } from 'express';
import * as LinkModel from '../models/Link';
import { generateQRCode, getQRCodeDataURL } from '../services/qrcodeService';
import { AuthenticatedRequest } from '../types/express.d';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middlewares/errorHandler';

export async function getQRCode(req: AuthenticatedRequest, res: Response): Promise<void> {
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

  const size = (req.query.size as 'small' | 'medium' | 'large') || 'medium';
  const format = (req.query.format as 'png' | 'svg' | 'dataurl') || 'png';

  if (!['small', 'medium', 'large'].includes(size)) {
    throw new BadRequestError('Invalid size. Use: small, medium, or large');
  }

  if (format === 'dataurl') {
    const dataUrl = await getQRCodeDataURL(link.short_code, { size });
    res.json({
      success: true,
      data: { dataUrl },
    });
    return;
  }

  const qrBuffer = await generateQRCode(link.short_code, {
    size,
    format: format as 'png' | 'svg',
  });

  const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${link.short_code}.${format}"`);
  res.send(qrBuffer);
}
