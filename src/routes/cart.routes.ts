import express from 'express';
import { body, param } from 'express-validator';
import { auth } from '../middleware/auth.middleware';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller';

const router = express.Router();

// Tất cả các routes giỏ hàng đều yêu cầu đăng nhập
router.use(auth);

// Lấy giỏ hàng của người dùng
router.get('/', getCart);

// Thêm sách vào giỏ hàng
router.post(
  '/add',
  [
    body('bookId').notEmpty().withMessage('ID sách là bắt buộc'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương')
  ],
  addToCart
);

// Cập nhật số lượng sách trong giỏ hàng
router.put(
  '/update',
  [
    body('itemId').notEmpty().withMessage('ID sản phẩm trong giỏ hàng là bắt buộc'),
    body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương')
  ],
  updateCartItem
);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:itemId', removeFromCart);

// Xóa toàn bộ giỏ hàng
router.delete('/clear', clearCart);

export default router;
