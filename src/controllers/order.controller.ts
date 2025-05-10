import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Order } from '../models/order.model';
import { Book } from '../models/book.model';

interface AuthRequest extends Request {
  user?: any;
}

// Create new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shippingAddress, paymentMethod } = req.body;
    let totalAmount = 0;

    // Calculate total amount and verify stock
    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book) {
        return res.status(404).json({ message: `Book not found: ${item.book}` });
      }
      if (book.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for book: ${book.title}` });
      }
      totalAmount += book.price * item.quantity;
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    // Update book stock
    for (const item of items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: -item.quantity },
      });
    }

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (admin)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.book', 'title author price')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments();

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.book', 'title author price coverImage')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.book', 'title author price coverImage');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or order owner
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 