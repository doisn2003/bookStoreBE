import { Request, Response } from 'express';
import { Cart } from '../models/cart.model';
import { Book } from '../models/book.model';
import mongoose from 'mongoose';

// Lấy giỏ hàng của người dùng
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.book',
      select: 'title author imageUrl price discount stock'
    });

    if (!cart) {
      // Nếu giỏ hàng chưa tồn tại, tạo giỏ hàng mới
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0
      });
      await cart.save();
    }

    res.json(cart);
  } catch (error: any) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Thêm sách vào giỏ hàng
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { bookId, quantity = 1 } = req.body;

    // Kiểm tra sách có tồn tại không
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    // Kiểm tra số lượng tồn kho
    if (book.stock < quantity) {
      return res.status(400).json({ 
        message: 'Số lượng sách trong kho không đủ',
        availableStock: book.stock
      });
    }

    // Tính giá sau khi giảm giá (nếu có)
    const priceAfterDiscount = book.discount 
      ? book.price * (1 - book.discount / 100) 
      : book.price;

    // Tìm giỏ hàng hiện tại hoặc tạo mới
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0
      });
    }

    // Kiểm tra xem sách đã có trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );

    if (existingItemIndex > -1) {
      // Cập nhật số lượng nếu sách đã có trong giỏ hàng
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Thêm sách mới vào giỏ hàng
      cart.items.push({
        book: new mongoose.Types.ObjectId(bookId),
        quantity,
        price: priceAfterDiscount
      });
    }

    // Cập nhật tổng tiền
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    // Trả về giỏ hàng đã được cập nhật với thông tin chi tiết sách
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.book',
      select: 'title author imageUrl price discount stock'
    });

    res.status(200).json(populatedCart);
  } catch (error: any) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Cập nhật số lượng sách trong giỏ hàng
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
    }

    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    // Tìm sản phẩm trong giỏ hàng
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    // Kiểm tra số lượng tồn kho
    const book = await Book.findById(cart.items[itemIndex].book);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    if (book.stock < quantity) {
      return res.status(400).json({ 
        message: 'Số lượng sách trong kho không đủ',
        availableStock: book.stock
      });
    }

    // Cập nhật số lượng
    cart.items[itemIndex].quantity = quantity;

    // Cập nhật tổng tiền
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    // Trả về giỏ hàng đã được cập nhật
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.book',
      select: 'title author imageUrl price discount stock'
    });

    res.status(200).json(populatedCart);
  } catch (error: any) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    // Xóa sản phẩm
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    // Cập nhật tổng tiền
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    // Trả về giỏ hàng đã được cập nhật
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.book',
      select: 'title author imageUrl price discount stock'
    });

    res.status(200).json(populatedCart);
  } catch (error: any) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    // Xóa tất cả sản phẩm
    cart.items = [];
    cart.totalAmount = 0;

    await cart.save();

    res.status(200).json({ message: 'Đã xóa giỏ hàng thành công', cart });
  } catch (error: any) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};
