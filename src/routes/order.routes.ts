import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getUserOrders,
} from '../controllers/order.controller';
import { auth, adminAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Create order
router.post(
  '/',
  auth,
  [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.book').notEmpty().withMessage('Book ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress').isObject().withMessage('Shipping address is required'),
    body('shippingAddress.street').notEmpty().withMessage('Street is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.country').notEmpty().withMessage('Country is required'),
    body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  createOrder
);

// Get all orders (admin only)
router.get('/', adminAuth, getOrders);

// Get user's orders
router.get('/my-orders', auth, getUserOrders);

// Get single order
router.get('/:id', auth, getOrder);

// Update order status (admin only)
router.patch(
  '/:id/status',
  adminAuth,
  [
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  updateOrderStatus
);

export default router; 