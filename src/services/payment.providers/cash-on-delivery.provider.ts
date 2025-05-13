import { Request, Response } from 'express';
import { IPaymentProvider, ICashOnDeliveryPayment, IPaymentResponse } from '../payment.interface';
import { Payment } from '../../models/payment.model';
import { Order } from '../../models/order.model';
import mongoose from 'mongoose';
import { generateTransactionId, updateOrderAfterPayment } from '../payment.service';

export class CashOnDeliveryProvider implements IPaymentProvider {
  /**
   * Process a cash on delivery payment
   * @param req - Express request
   * @param res - Express response
   */
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.body as ICashOnDeliveryPayment;

      if (!orderId) {
        res.status(400).json({ message: 'Vui lòng cung cấp mã đơn hàng' });
        return;
      }

      // Validate if orderId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
        return;
      }

      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        return;
      }

      // Create a new payment record
      const payment = new Payment({
        order: order._id,
        user: req.body.userId || order.user,
        amount: order.totalAmount,
        method: 'cash_on_delivery',
        status: 'pending', // For COD, initial status is pending until delivery
        transactionId: generateTransactionId('COD'),
        paymentDate: new Date(),
      });

      await payment.save();

      // Update order payment status
      await updateOrderAfterPayment(order._id, 'pending');

      const response: IPaymentResponse = {
        success: true,
        message: 'Thanh toán khi nhận hàng đã được xử lý thành công',
        paymentId: payment._id.toString(),
        transactionId: payment.transactionId,
        status: payment.status,
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Cash on delivery payment error:', error);
      res.status(500).json({ 
        success: false,
        message: `Lỗi thanh toán: ${error.message}` 
      });
    }
  }

  /**
   * Verify a COD payment
   * For COD, verification happens on delivery
   */
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        res.status(400).json({ message: 'Mã thanh toán không hợp lệ' });
        return;
      }

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán' });
        return;
      }

      if (payment.method !== 'cash_on_delivery') {
        res.status(400).json({ message: 'Phương thức thanh toán không phù hợp' });
        return;
      }

      // Update payment status to completed (simulating successful delivery and payment)
      payment.status = 'completed';
      payment.paymentDate = new Date();
      await payment.save();

      // Update order status
      await updateOrderAfterPayment(payment.order, 'completed');

      res.status(200).json({
        success: true,
        message: 'Xác nhận thanh toán khi nhận hàng thành công',
        paymentId: payment._id,
        status: payment.status,
      });
    } catch (error: any) {
      console.error('Verify COD payment error:', error);
      res.status(500).json({ 
        success: false,
        message: `Lỗi xác nhận thanh toán: ${error.message}` 
      });
    }
  }

  /**
   * Refund a COD payment
   * For COD, refund would happen when delivery fails or customer refuses the package
   */
  async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;

      if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        res.status(400).json({ message: 'Mã thanh toán không hợp lệ' });
        return;
      }

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán' });
        return;
      }

      if (payment.method !== 'cash_on_delivery') {
        res.status(400).json({ message: 'Phương thức thanh toán không phù hợp' });
        return;
      }

      // Update payment status to refunded
      payment.status = 'refunded';
      await payment.save();

      // Update order status
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = 'cancelled';
        order.paymentStatus = 'failed';
        await order.save();
      }

      res.status(200).json({
        success: true,
        message: 'Hủy thanh toán khi nhận hàng thành công',
        paymentId: payment._id,
        reason,
      });
    } catch (error: any) {
      console.error('Refund COD payment error:', error);
      res.status(500).json({ 
        success: false,
        message: `Lỗi hủy thanh toán: ${error.message}` 
      });
    }
  }

  /**
   * Get information about the COD payment method
   */
  getPaymentInfo() {
    return {
      name: 'Thanh toán khi nhận hàng',
      description: 'Thanh toán tiền mặt khi nhận hàng tại địa chỉ giao hàng',
      isActive: true,
      requiresRedirect: false,
    };
  }
} 