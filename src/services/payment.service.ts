import { Payment } from '../models/payment.model';
import { Order } from '../models/order.model';
import mongoose from 'mongoose';

/**
 * Tạo mã giao dịch ngẫu nhiên
 * @param prefix Tiền tố cho mã giao dịch (COD, BT, ETH)
 * @returns Mã giao dịch duy nhất
 */
export const generateTransactionId = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Cập nhật trạng thái đơn hàng sau khi thanh toán
 * @param orderId ID đơn hàng
 * @param paymentStatus Trạng thái thanh toán
 */
export const updateOrderAfterPayment = async (
  orderId: mongoose.Types.ObjectId | string,
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
): Promise<void> => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    order.paymentStatus = paymentStatus;

    // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng
    if (paymentStatus === 'completed' && order.status === 'pending') {
      order.status = 'processing';
    }

    // Nếu thanh toán thất bại hoặc hoàn tiền, hủy đơn hàng
    if (['failed', 'refunded'].includes(paymentStatus)) {
      order.status = 'cancelled';
    }

    await order.save();
  } catch (error) {
    console.error('Error updating order after payment:', error);
    throw error;
  }
};

/**
 * Mock kiểm tra chuyển khoản ngân hàng - luôn trả về thành công
 * @returns Kết quả xác minh
 */
export const mockVerifyBankTransfer = async (): Promise<{
  success: boolean;
  verificationId: string;
  timestamp: Date;
}> => {
  // Trong môi trường thực tế, đây sẽ là tích hợp với cổng thanh toán hoặc API ngân hàng
  return {
    success: true,
    verificationId: `VERIFY-${Date.now()}`,
    timestamp: new Date(),
  };
};

/**
 * Mock xác minh thanh toán khi nhận hàng - luôn trả về thành công
 * @returns Kết quả xác minh
 */
export const mockVerifyCashOnDelivery = async (): Promise<{
  success: boolean;
  verificationId: string;
  timestamp: Date;
}> => {
  // Trong môi trường thực tế, đây sẽ là xác nhận từ đơn vị vận chuyển
  return {
    success: true,
    verificationId: `COD-VERIFY-${Date.now()}`,
    timestamp: new Date(),
  };
}; 