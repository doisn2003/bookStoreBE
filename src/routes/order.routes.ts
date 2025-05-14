import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getUserOrders,
  createOrderFromCart
} from '../controllers/order.controller';
import { auth, adminAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Create order
router.post(
  '/',
  auth,
  [
    body('items').isArray().withMessage('Sản phẩm phải là một mảng'),
    body('items.*.book').notEmpty().withMessage('ID sách là bắt buộc'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Số lượng phải ít nhất là 1'),
    body('shippingAddress').isObject().withMessage('Địa chỉ giao hàng là bắt buộc'),
    body('shippingAddress.street').notEmpty().withMessage('Đường/Phố là bắt buộc'),
    body('shippingAddress.city').notEmpty().withMessage('Thành phố là bắt buộc'),
    body('shippingAddress.state').notEmpty().withMessage('Tỉnh/Thành phố là bắt buộc'),
    body('shippingAddress.country').notEmpty().withMessage('Quốc gia là bắt buộc'),
    body('shippingAddress.zipCode').notEmpty().withMessage('Mã bưu điện là bắt buộc'),
    body('paymentMethod').notEmpty().withMessage('Phương thức thanh toán là bắt buộc'),
  ],
  createOrder
);

// Tạo đơn hàng từ giỏ hàng
router.post(
  '/from-cart',
  auth,
  [
    body('shippingAddress').isObject().withMessage('Địa chỉ giao hàng là bắt buộc'),
    body('shippingAddress.street').notEmpty().withMessage('Đường/Phố là bắt buộc'),
    body('shippingAddress.city').notEmpty().withMessage('Thành phố là bắt buộc'),
    body('shippingAddress.state').notEmpty().withMessage('Tỉnh/Thành phố là bắt buộc'),
    body('shippingAddress.country').notEmpty().withMessage('Quốc gia là bắt buộc'),
    body('shippingAddress.zipCode').notEmpty().withMessage('Mã bưu điện là bắt buộc'),
    body('paymentMethod').notEmpty().withMessage('Phương thức thanh toán là bắt buộc')
  ],
  createOrderFromCart
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
      .withMessage('Trạng thái không hợp lệ'),
  ],
  updateOrderStatus
);

export default router; 