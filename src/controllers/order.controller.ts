import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Order } from '../models/order.model';
import { Book } from '../models/book.model';
import { Cart } from '../models/cart.model';

interface AuthRequest extends Request {
  user?: any;
}

// Create new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id || req.user._id;
    const { items, shippingAddress, paymentMethod } = req.body;
    let totalAmount = 0;

    // Calculate total amount and verify stock
    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book) {
        return res.status(404).json({ message: `Không tìm thấy sách: ${item.book}` });
      }
      if (book.stock < item.quantity) {
        return res.status(400).json({ message: `Số lượng sách không đủ: ${book.title}` });
      }
      
      // Tính giá sau khi giảm giá
      const priceAfterDiscount = book.discount ? book.price * (1 - book.discount / 100) : book.price;
      totalAmount += priceAfterDiscount * item.quantity;
    }

    // Create order
    const order = new Order({
      user: userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    // Update book stock and sales count
    for (const item of items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { 
          stock: -item.quantity,
          salesCount: item.quantity
        },
      });
    }

    await order.save();
    res.status(201).json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Tạo đơn hàng từ giỏ hàng
export const createOrderFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id || req.user._id;
    const { shippingAddress, paymentMethod } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Địa chỉ giao hàng và phương thức thanh toán là bắt buộc' 
      });
    }

    // Lấy giỏ hàng hiện tại
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Kiểm tra số lượng tồn kho của tất cả sản phẩm
    for (const item of cart.items) {
      const book = await Book.findById(item.book);
      if (!book) {
        return res.status(404).json({ 
          message: `Không tìm thấy sách có ID: ${item.book}` 
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Sách "${book.title}" chỉ còn ${book.stock} quyển trong kho`, 
          bookId: book._id
        });
      }
    }

    // Tạo đơn hàng mới
    const order = new Order({
      user: userId,
      items: cart.items,
      totalAmount: cart.totalAmount,
      status: 'pending',
      shippingAddress,
      paymentStatus: 'pending',
      paymentMethod
    });

    await order.save();

    // Cập nhật số lượng tồn kho và số lượng bán
    for (const item of cart.items) {
      await Book.findByIdAndUpdate(item.book, { 
        $inc: { 
          stock: -item.quantity, 
          salesCount: item.quantity 
        } 
      });
    }

    // Xóa giỏ hàng sau khi đã tạo đơn hàng
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Trả về đơn hàng đã tạo với thông tin chi tiết
    const populatedOrder = await Order.findById(order._id).populate({
      path: 'items.book',
      select: 'title author imageUrl'
    });

    res.status(201).json(populatedOrder);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
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
      .populate('items.book', 'title author price imageUrl')
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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const orders = await Order.find({ user: userId })
      .populate('items.book', 'title author price imageUrl')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get single order
export const getOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.book', 'title author price imageUrl');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check if user is admin or order owner
    if (order.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
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
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
}; 