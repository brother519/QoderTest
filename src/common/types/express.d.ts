import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }
  }
}
