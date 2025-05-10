import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// Register route
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  register
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Get profile route
router.get('/profile', auth, getProfile);

// Update profile route
router.put(
  '/profile',
  auth,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
  ],
  updateProfile
);

export default router; 