import express, { Request, Response } from 'express';
import {
  getPaymentById, 
  getPaymentsByOrderId, 
  updatePaymentStatus
} from '../controllers/payment.controller';
import { PaymentFactory } from '../services/payment.factory';

// Initialize payment providers
PaymentFactory.init();

const router = express.Router();

// Get available payment methods
router.get('/methods', (req: Request, res: Response) => {
  const methods = PaymentFactory.getAvailablePaymentMethods();
  res.status(200).json({
    success: true,
    methods,
  });
});

// Public routes
router.get('/:id', getPaymentById);
router.get('/order/:orderId', getPaymentsByOrderId);

// Process payments
router.post('/process/:method', (req: Request, res: Response) => {
  const { method } = req.params;
  PaymentFactory.processPayment(method, req, res);
});

// Verify payments
router.post('/verify/:method/:paymentId', (req: Request, res: Response) => {
  const { method } = req.params;
  PaymentFactory.verifyPayment(method, req, res);
});

// Refund payments
router.post('/refund/:method/:paymentId', (req: Request, res: Response) => {
  const { method } = req.params;
  PaymentFactory.refundPayment(method, req, res);
});

// Update payment (Admin only - will add middleware later)
router.put('/:id', updatePaymentStatus);

// Legacy routes for backward compatibility
router.post('/cash-on-delivery', (req: Request, res: Response) => {
  PaymentFactory.processPayment('cash_on_delivery', req, res);
});

router.post('/bank-transfer', (req: Request, res: Response) => {
  PaymentFactory.processPayment('bank_transfer', req, res);
});

export default router; 