import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { Payment } from '../models/payment.model';
import { Order } from '../models/order.model';
import { createTestUser, generateTestToken } from './helpers';

let token: string;
let userId: string;
let orderId: string;
let paymentId: string;

beforeAll(async () => {
  // Tạo user test
  const user = await createTestUser();
  userId = user._id.toString();

  // Tạo token
  token = generateTestToken(user);

  // Tạo đơn hàng test
  const order = new Order({
    user: userId,
    items: [
      {
        book: new mongoose.Types.ObjectId(),
        quantity: 2,
        price: 100000
      }
    ],
    totalAmount: 200000,
    status: 'pending',
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      country: 'Vietnam',
      zipCode: '10000'
    },
    paymentStatus: 'pending',
    paymentMethod: 'cash_on_delivery'
  });
  await order.save();
  orderId = order._id.toString();
});

describe('Payment API Tests', () => {
  // Test tạo giao dịch thanh toán
  it('should create a new payment', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        userId,
        method: 'cash_on_delivery',
        amount: 200000
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('transactionId');
    expect(res.body.data.method).toBe('cash_on_delivery');
    
    paymentId = res.body.data._id;
  });

  // Test xác nhận thanh toán COD
  it('should confirm COD payment', async () => {
    const res = await request(app)
      .post(`/api/payments/cod/${paymentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');

    // Kiểm tra đơn hàng đã được cập nhật
    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder?.paymentStatus).toBe('completed');
  });

  // Test tạo giao dịch thanh toán chuyển khoản
  it('should create a bank transfer payment', async () => {
    // Tạo đơn hàng mới
    const order = new Order({
      user: userId,
      items: [
        {
          book: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 150000
        }
      ],
      totalAmount: 150000,
      status: 'pending',
      shippingAddress: {
        street: '456 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Vietnam',
        zipCode: '10000'
      },
      paymentStatus: 'pending',
      paymentMethod: 'bank_transfer'
    });
    await order.save();
    const newOrderId = order._id.toString();

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId: newOrderId,
        userId,
        method: 'bank_transfer',
        amount: 150000
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.method).toBe('bank_transfer');
    
    const bankPaymentId = res.body.data._id;

    // Xác nhận chuyển khoản
    const confirmRes = await request(app)
      .post(`/api/payments/bank-transfer/${bankPaymentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        referenceCode: 'REF123456'
      });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.success).toBe(true);
    expect(confirmRes.body.data.status).toBe('completed');
    expect(confirmRes.body.data.bankDetails.bankName).toBe('Test Bank');
  });

  // Test lấy thanh toán theo ID
  it('should get payment by ID', async () => {
    const res = await request(app)
      .get(`/api/payments/${paymentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(paymentId);
  });

  // Test lấy thanh toán của người dùng
  it('should get payments by user ID', async () => {
    const res = await request(app)
      .get(`/api/payments/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Test hủy thanh toán
  it('should cancel a payment', async () => {
    // Tạo đơn hàng và thanh toán mới để hủy
    const order = new Order({
      user: userId,
      items: [{ book: new mongoose.Types.ObjectId(), quantity: 1, price: 50000 }],
      totalAmount: 50000,
      status: 'pending',
      shippingAddress: {
        street: '789 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Vietnam',
        zipCode: '10000'
      },
      paymentStatus: 'pending',
      paymentMethod: 'bank_transfer'
    });
    await order.save();

    const payment = new Payment({
      order: order._id,
      user: userId,
      amount: 50000,
      method: 'bank_transfer',
      status: 'pending',
      transactionId: `BT-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    });
    await payment.save();

    const res = await request(app)
      .put(`/api/payments/cancel/${payment._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('failed');

    // Kiểm tra đơn hàng đã được cập nhật
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder?.paymentStatus).toBe('failed');
  });
}); 