import { Request, Response } from 'express';
import { IPaymentProvider, IBankTransferPayment, IPaymentResponse } from '../payment.interface';
import { Payment } from '../../models/payment.model';
import { Order } from '../../models/order.model';
import mongoose from 'mongoose';
import { generateTransactionId, updateOrderAfterPayment, mockVerifyBankTransfer } from '../payment.service';

export class BankTransferProvider implements IPaymentProvider {
  /**
   * Process a bank transfer payment
   * @param req - Express request
   * @param res - Express response
   */
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, bankDetails } = req.body as IBankTransferPayment;

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

      // Validate bank details
      if (!bankDetails || !bankDetails.bankName || !bankDetails.accountNumber) {
        res.status(400).json({ message: 'Thông tin ngân hàng không đầy đủ' });
        return;
      }

      // Mock successful bank transfer verification
      const verificationResult = await mockVerifyBankTransfer();

      // Create a new payment record
      const payment = new Payment({
        order: order._id,
        user: req.body.userId || order.user,
        amount: order.totalAmount,
        method: 'bank_transfer',
        status: 'completed', // For mock implementation, always set to completed
        transactionId: generateTransactionId('BT'),
        bankDetails: {
          bankName: bankDetails.bankName,
          accountNumber: bankDetails.accountNumber,
          transferDate: bankDetails.transferDate || new Date(),
          referenceCode: verificationResult.verificationId,
        },
        paymentDate: new Date(),
      });

      await payment.save();

      // Update order payment status
      await updateOrderAfterPayment(order._id, 'completed');

      const response: IPaymentResponse = {
        success: true,
        message: 'Thanh toán chuyển khoản ngân hàng đã được xử lý thành công',
        paymentId: payment._id.toString(),
        transactionId: payment.transactionId,
        status: payment.status,
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Bank transfer payment error:', error);
      res.status(500).json({
        success: false,
        message: `Lỗi thanh toán: ${error.message}`,
      });
    }
  }

  /**
   * Verify a bank transfer payment
   * For our mock implementation, verification is automatic
   */
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { referenceCode } = req.body;

      if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        res.status(400).json({ message: 'Mã thanh toán không hợp lệ' });
        return;
      }

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán' });
        return;
      }

      if (payment.method !== 'bank_transfer') {
        res.status(400).json({ message: 'Phương thức thanh toán không phù hợp' });
        return;
      }

      // In a real application, you would verify the bank transfer using the reference code
      // For our mock, we always succeed
      
      // Update payment status to completed if it's still pending
      if (payment.status === 'pending') {
        payment.status = 'completed';
        payment.paymentDate = new Date();
        
        // Update the reference code if provided
        if (referenceCode && payment.bankDetails) {
          payment.bankDetails.referenceCode = referenceCode;
        }
        
        await payment.save();

        // Update order status
        await updateOrderAfterPayment(payment.order, 'completed');
      }

      res.status(200).json({
        success: true,
        message: 'Xác nhận thanh toán chuyển khoản ngân hàng thành công',
        paymentId: payment._id,
        status: payment.status,
      });
    } catch (error: any) {
      console.error('Verify bank transfer payment error:', error);
      res.status(500).json({
        success: false,
        message: `Lỗi xác nhận thanh toán: ${error.message}`,
      });
    }
  }

  /**
   * Refund a bank transfer payment
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

      if (payment.method !== 'bank_transfer') {
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
        message: 'Hoàn tiền chuyển khoản ngân hàng thành công',
        paymentId: payment._id,
        reason,
      });
    } catch (error: any) {
      console.error('Refund bank transfer payment error:', error);
      res.status(500).json({
        success: false,
        message: `Lỗi hoàn tiền: ${error.message}`,
      });
    }
  }

  /**
   * Get information about the bank transfer payment method
   */
  getPaymentInfo() {
    return {
      name: 'Chuyển khoản ngân hàng',
      description: 'Thanh toán bằng chuyển khoản ngân hàng trực tiếp',
      isActive: true,
      requiresRedirect: false,
    };
  }
} 