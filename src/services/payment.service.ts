import { Payment } from '../models/payment.model';
import { Order } from '../models/order.model';
import mongoose from 'mongoose';

/**
 * Generate a transaction ID
 * @param prefix - Payment method prefix (COD, BT, etc.)
 * @returns A unique transaction ID
 */
export const generateTransactionId = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Update order status after payment
 * @param orderId - Order ID
 * @param paymentStatus - New payment status
 */
export const updateOrderAfterPayment = async (
  orderId: mongoose.Types.ObjectId | string,
  paymentStatus: 'pending' | 'completed' | 'failed'
): Promise<void> => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Đơn hàng không tồn tại');
  }

  order.paymentStatus = paymentStatus;
  
  // If payment is completed, update order status
  if (paymentStatus === 'completed' && order.status === 'pending') {
    order.status = 'processing';
  }
  
  await order.save();
};

/**
 * Get payment statistics by method
 * @returns Payment statistics by method
 */
export const getPaymentStatsByMethod = async (): Promise<any> => {
  const stats = await Payment.aggregate([
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
      },
    },
    {
      $project: {
        method: '$_id',
        count: 1,
        totalAmount: 1,
        avgAmount: 1,
        _id: 0,
      },
    },
  ]);

  return stats;
};

/**
 * Get payment statistics by status
 * @returns Payment statistics by status
 */
export const getPaymentStatsByStatus = async (): Promise<any> => {
  const stats = await Payment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0,
      },
    },
  ]);

  return stats;
};

/**
 * Mock bank transfer verification
 * Always returns success for now
 * @returns Verification result
 */
export const mockVerifyBankTransfer = async (): Promise<{
  success: boolean;
  verificationId: string;
  timestamp: Date;
}> => {
  // In a real application, this would contact a payment gateway or bank API
  return {
    success: true,
    verificationId: `VERIFY-${Date.now()}`,
    timestamp: new Date(),
  };
};

/**
 * Find payments by user ID
 * @param userId - User ID
 * @returns User payments
 */
export const findPaymentsByUser = async (
  userId: mongoose.Types.ObjectId | string
): Promise<any[]> => {
  return await Payment.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('order', 'orderId totalAmount status');
}; 