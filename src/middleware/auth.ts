import { auth, adminAuth } from './auth.middleware';

export const verifyToken = auth;
export const verifyAdmin = adminAuth;

export default {
  verifyToken,
  verifyAdmin
}; 