import { Request } from 'express';
import { JwtPayload } from '../config/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
