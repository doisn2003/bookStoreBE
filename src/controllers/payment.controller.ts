import { Request, Response } from 'express';
import { Payment } from '../models/payment.model';
import { Order } from '../models/order.model';
import mongoose from 'mongoose';
import {
  generateTransactionId,
  updateOrderAfterPayment,
  mockVerifyBankTransfer,
  mockVerifyCashOnDelivery
} from '../services/payment.service';
import {
  createEthereumTransaction,
  verifyEthereumTransaction,
  getHardhatAccounts
} from '../services/ethereum.service';

/**
 * Tạo một giao dịch thanh toán mới
 */
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, userId, method, amount, bankDetails } = req.body;

    // Kiểm tra đơn hàng tồn tại
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    // Kiểm tra phương thức thanh toán hợp lệ
    const validMethods = ['cash_on_delivery', 'bank_transfer', 'ethereum'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ' });
    }

    // Tạo mã giao dịch tùy theo phương thức thanh toán
    let transactionId;
    if (method === 'cash_on_delivery') {
      transactionId = generateTransactionId('COD');
    } else if (method === 'bank_transfer') {
      transactionId = generateTransactionId('BT');
    } else if (method === 'ethereum') {
      transactionId = generateTransactionId('ETH');
    }

    // Tạo thanh toán mới
    const payment = new Payment({
      order: orderId,
      user: userId,
      amount: amount || order.totalAmount,
      method,
      status: 'pending',
      transactionId,
      bankDetails
    });

    await payment.save();

    // Cập nhật phương thức thanh toán cho đơn hàng
    order.paymentMethod = method;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Tạo giao dịch thanh toán thành công',
      data: payment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo giao dịch thanh toán',
      error: error.message
    });
  }
};

/**
 * Xác nhận thanh toán khi nhận hàng (COD)
 */
export const confirmCashOnDelivery = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán' });
    }

    if (payment.method !== 'cash_on_delivery') {
      return res.status(400).json({ success: false, message: 'Giao dịch này không phải phương thức thanh toán khi nhận hàng' });
    }

    // Mock xác nhận thanh toán COD
    const verification = await mockVerifyCashOnDelivery();
    
    if (verification.success) {
      payment.status = 'completed';
      payment.paymentDate = new Date();
      await payment.save();

      // Cập nhật đơn hàng
      await updateOrderAfterPayment(payment.order, 'completed');

      return res.status(200).json({
        success: true,
        message: 'Xác nhận thanh toán khi nhận hàng thành công',
        data: payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      await updateOrderAfterPayment(payment.order, 'failed');

      return res.status(400).json({
        success: false,
        message: 'Xác nhận thanh toán thất bại',
        data: payment
      });
    }
  } catch (error) {
    console.error('Error confirming COD payment:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xác nhận thanh toán',
      error: error.message
    });
  }
};

/**
 * Xác nhận thanh toán chuyển khoản ngân hàng
 */
export const confirmBankTransfer = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { bankName, accountNumber, referenceCode } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán' });
    }

    if (payment.method !== 'bank_transfer') {
      return res.status(400).json({ success: false, message: 'Giao dịch này không phải phương thức chuyển khoản ngân hàng' });
    }

    // Cập nhật thông tin ngân hàng
    payment.bankDetails = {
      ...payment.bankDetails,
      bankName,
      accountNumber,
      transferDate: new Date(),
      referenceCode
    };

    // Mock xác minh chuyển khoản
    const verification = await mockVerifyBankTransfer();
    
    if (verification.success) {
      payment.status = 'completed';
      payment.paymentDate = new Date();
      await payment.save();

      // Cập nhật đơn hàng
      await updateOrderAfterPayment(payment.order, 'completed');

      return res.status(200).json({
        success: true,
        message: 'Xác nhận chuyển khoản thành công',
        data: payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      await updateOrderAfterPayment(payment.order, 'failed');

      return res.status(400).json({
        success: false,
        message: 'Xác nhận chuyển khoản thất bại',
        data: payment
      });
    }
  } catch (error) {
    console.error('Error confirming bank transfer:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xác nhận chuyển khoản',
      error: error.message
    });
  }
};

/**
 * Lấy thông tin thanh toán theo ID
 */
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán' });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin thanh toán',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách thanh toán của người dùng
 */
export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('order');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error getting user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách thanh toán',
      error: error.message
    });
  }
};

/**
 * Hủy giao dịch thanh toán
 */
export const cancelPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán' });
    }

    // Chỉ hủy được giao dịch đang ở trạng thái chờ
    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Chỉ có thể hủy giao dịch đang ở trạng thái chờ' 
      });
    }

    payment.status = 'failed';
    await payment.save();

    // Cập nhật đơn hàng
    await updateOrderAfterPayment(payment.order, 'failed');

    res.status(200).json({
      success: true,
      message: 'Hủy giao dịch thanh toán thành công',
      data: payment
    });
  } catch (error) {
    console.error('Error canceling payment:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi hủy giao dịch thanh toán',
      error: error.message
    });
  }
};

/**
 * Tạo giao dịch thanh toán Ethereum
 */
export const createEthereumPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, userAddress } = req.body;

    // Kiểm tra đơn hàng tồn tại
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    // Tạo mã giao dịch
    const transactionId = generateTransactionId('ETH');
    
    // Tạo transaction data cho Ethereum - truyền userAddress để biết đây là tài khoản nào
    const ethereumTx = await createEthereumTransaction(orderId, userAddress);

    // Tạo thanh toán mới
    const payment = new Payment({
      order: orderId,
      user: order.user,
      amount: order.totalAmount,
      method: 'ethereum',
      status: 'pending',
      transactionId,
      ethereumDetails: {
        address: userAddress
      }
    });

    await payment.save();

    // Cập nhật phương thức thanh toán cho đơn hàng
    order.paymentMethod = 'ethereum';
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Tạo giao dịch thanh toán Ethereum thành công',
      data: {
        payment,
        ethereum: {
          contractAddress: ethereumTx.contractAddress,
          orderAmount: ethereumTx.orderAmount,
          transactionData: ethereumTx.transactionData
        }
      }
    });
  } catch (error) {
    console.error('Error creating Ethereum payment:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo giao dịch thanh toán Ethereum',
      error: error.message
    });
  }
};

/**
 * Xác nhận thanh toán Ethereum
 */
export const confirmEthereumPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { transactionHash } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán' });
    }

    if (payment.method !== 'ethereum') {
      return res.status(400).json({ success: false, message: 'Giao dịch này không phải phương thức thanh toán Ethereum' });
    }

    // Cập nhật transaction hash
    payment.ethereumDetails = {
      ...payment.ethereumDetails,
      transactionHash
    };

    // Xác minh transaction trên blockchain
    const orderId = payment.order.toString();
    const isVerified = await verifyEthereumTransaction(transactionHash, orderId);
    
    if (isVerified) {
      payment.status = 'completed';
      payment.paymentDate = new Date();
      await payment.save();

      // Cập nhật đơn hàng
      await updateOrderAfterPayment(payment.order, 'completed');

      return res.status(200).json({
        success: true,
        message: 'Xác nhận thanh toán Ethereum thành công',
        data: payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      await updateOrderAfterPayment(payment.order, 'failed');

      return res.status(400).json({
        success: false,
        message: 'Xác nhận thanh toán Ethereum thất bại',
        data: payment
      });
    }
  } catch (error) {
    console.error('Error confirming Ethereum payment:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xác nhận thanh toán Ethereum',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách các tài khoản Hardhat (chỉ dùng cho môi trường test)
 */
export const getTestAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = getHardhatAccounts();
    
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách tài khoản test thành công',
      data: accounts
    });
  } catch (error: any) {
    console.error('Error getting test accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách tài khoản test',
      error: error.message
    });
  }
}; 