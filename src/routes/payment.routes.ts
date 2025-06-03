import express from 'express';
import {
  createPayment,
  confirmCashOnDelivery,
  confirmBankTransfer,
  getPaymentById,
  getUserPayments,
  cancelPayment,
  createEthereumPayment,
  confirmEthereumPayment,
  getTestAccounts
} from '../controllers/payment.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /api/payments
 * @desc Tạo giao dịch thanh toán mới
 * @access Private
 */
router.post('/', verifyToken, createPayment);

/**
 * @route POST /api/payments/cod/:paymentId
 * @desc Xác nhận thanh toán khi nhận hàng
 * @access Private
 */
router.post('/cod/:paymentId', verifyToken, confirmCashOnDelivery);

/**
 * @route POST /api/payments/bank-transfer/:paymentId
 * @desc Xác nhận thanh toán chuyển khoản ngân hàng
 * @access Private
 */
router.post('/bank-transfer/:paymentId', verifyToken, confirmBankTransfer);

/**
 * @route GET /api/payments/:paymentId
 * @desc Lấy thông tin thanh toán theo ID
 * @access Private
 */
router.get('/:paymentId', verifyToken, getPaymentById);

/**
 * @route GET /api/payments/user/:userId
 * @desc Lấy danh sách thanh toán của người dùng
 * @access Private
 */
router.get('/user/:userId', verifyToken, getUserPayments);

/**
 * @route PUT /api/payments/cancel/:paymentId
 * @desc Hủy giao dịch thanh toán
 * @access Private
 */
router.put('/cancel/:paymentId', verifyToken, cancelPayment);

/**
 * @route POST /api/payments/ethereum
 * @desc Tạo giao dịch thanh toán Ethereum
 * @access Public - cho phép test dễ dàng
 */
router.post('/ethereum', createEthereumPayment);

/**
 * @route POST /api/payments/ethereum/:paymentId
 * @desc Xác nhận thanh toán Ethereum
 * @access Public - cho phép test dễ dàng
 */
router.post('/ethereum/:paymentId', confirmEthereumPayment);

/**
 * @route GET /api/payments/ethereum/test-accounts
 * @desc Lấy danh sách tài khoản test (chỉ dùng cho môi trường dev)
 * @access Public - cho phép test dễ dàng
 */
router.get('/ethereum/test-accounts', getTestAccounts);

export default router; 