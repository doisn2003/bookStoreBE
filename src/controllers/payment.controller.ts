import { Request, Response } from 'express';
import { Payment } from '../models/payment.model';
import { Order } from '../models/order.model';
import mongoose from 'mongoose';
import {
  generateTransactionId,
  updateOrderAfterPayment,
  mockVerifyBankTransfer
} from '../services/payment.service';

/**
 * @desc    Process cash on delivery payment
 * @route   POST /api/payments/cash-on-delivery
 * @access  Private
 */
export const processCashOnDeliveryPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã đơn hàng' });
    }

    // Validate if orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Create a new payment record
    const payment = new Payment({
      order: order._id,
      user: req.body.userId || order.user, // Assuming user ID is in request or from order
      amount: order.totalAmount,
      method: 'cash_on_delivery',
      status: 'pending', // For COD, initial status is pending until delivery
      transactionId: generateTransactionId('COD'),
      paymentDate: new Date(),
    });

    await payment.save();

    // Update order payment status
    await updateOrderAfterPayment(order._id, 'pending');

    return res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        method: payment.method,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      },
      message: 'Thanh toán khi nhận hàng đã được xử lý thành công',
    });
  } catch (error: any) {
    console.error('Cash on delivery payment error:', error);
    return res.status(500).json({ message: `Lỗi thanh toán: ${error.message}` });
  }
};

/**
 * @desc    Process bank transfer payment
 * @route   POST /api/payments/bank-transfer
 * @access  Private
 */
export const processBankTransferPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, bankDetails } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã đơn hàng' });
    }

    // Validate if orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Validate bank details (in a real app, you'd verify more thoroughly)
    if (!bankDetails || !bankDetails.bankName || !bankDetails.accountNumber) {
      return res.status(400).json({ message: 'Thông tin ngân hàng không đầy đủ' });
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

    return res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        method: payment.method,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        bankDetails: {
          bankName: payment.bankDetails?.bankName,
          referenceCode: payment.bankDetails?.referenceCode,
        },
      },
      message: 'Thanh toán chuyển khoản ngân hàng đã được xử lý thành công',
    });
  } catch (error: any) {
    console.error('Bank transfer payment error:', error);
    return res.status(500).json({ message: `Lỗi thanh toán: ${error.message}` });
  }
};

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;

    // Validate if paymentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Mã thanh toán không hợp lệ' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán' });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error('Get payment error:', error);
    return res.status(500).json({ message: `Lỗi: ${error.message}` });
  }
};

/**
 * @desc    Get payments by order ID
 * @route   GET /api/payments/order/:orderId
 * @access  Private
 */
export const getPaymentsByOrderId = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;

    // Validate if orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
    }

    const payments = await Payment.find({ order: orderId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error: any) {
    console.error('Get payments by order error:', error);
    return res.status(500).json({ message: `Lỗi: ${error.message}` });
  }
};

/**
 * @desc    Update payment status
 * @route   PUT /api/payments/:id
 * @access  Private/Admin
 */
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const paymentId = req.params.id;

    // Validate status
    if (!status || !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ' });
    }

    // Validate if paymentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Mã thanh toán không hợp lệ' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán' });
    }

    // Update payment status
    payment.status = status;
    
    // If payment is completed, update payment date
    if (status === 'completed') {
      payment.paymentDate = new Date();
    }

    await payment.save();

    // Update order payment status
    if (payment.order) {
      await updateOrderAfterPayment(
        payment.order, 
        status as 'pending' | 'completed' | 'failed'
      );
    }

    return res.status(200).json({
      success: true,
      payment,
      message: 'Trạng thái thanh toán đã được cập nhật',
    });
  } catch (error: any) {
    console.error('Update payment status error:', error);
    return res.status(500).json({ message: `Lỗi: ${error.message}` });
  }
}; 