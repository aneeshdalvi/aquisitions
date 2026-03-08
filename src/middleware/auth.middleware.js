import { jwttoken } from '#utils/jwt.js';
import logger from '#config/logger.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }

    req.user = jwttoken.verify(token);
    next();
  } catch (e) {
    logger.error('Authentication error', e);
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

export const requireRole = roles => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
  }
  next();
};
