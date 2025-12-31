import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Token verification error:', error.message);
      res.status(401).json({ 
        success: false, 
        error: error.message || 'Invalid or expired token' 
      });
      return;
    }

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    // Get user role from metadata
    const role = (user.user_metadata?.role as string) || 'staff';

    req.user = {
      id: user.id,
      email: user.email || user.user_metadata?.email || '',
      role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }

  next();
};

