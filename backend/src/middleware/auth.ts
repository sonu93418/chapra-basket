import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRole } from '../types/domain.js';

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwtSecret) as AuthUser;
  } catch {
    req.user = undefined;
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    next();
  });
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
      }
      next();
    });
  };
}
