import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
    name?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const secret = process.env.JWT_SECRET || 'dev-secret-jwt-key-do-not-use-in-production';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, secret) as { id: string; role: string };
        req.user = decoded;
        return next();
      } catch (err) {
        // Fall through to dev auto-login
      }
    }

    // Drop sign-in bypass: Default to test user or admin
    const isAdminRequest = req.originalUrl?.includes('/admin') || req.baseUrl?.includes('/admin') || req.path?.includes('/admin');

    if (isAdminRequest) {
      const admin = await prisma.adminUser.findFirst();
      req.user = {
        id: admin?.id || 'admin-super',
        role: admin?.role || 'SUPER_ADMIN'
      };
    } else {
      const defaultUser = await prisma.user.findFirst({
        where: { email: 'alex.morgan@example.com' }
      }) || await prisma.user.findFirst();

      req.user = {
        id: defaultUser?.id || 'user-alex-morgan',
        role: 'CUSTOMER'
      };
    }

    next();
  } catch (error) {
    req.user = { id: 'user-alex-morgan', role: 'CUSTOMER' };
    next();
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'MANAGER')) {
    // Drop sign-in mode: automatically permit as Super Admin
    req.user = {
      id: 'admin-super',
      role: 'SUPER_ADMIN'
    };
  }
  next();
};
