import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Book, BookCategory } from '../models/book.model';
import mongoose from 'mongoose';

// Create a new book
export const createBook = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = new Book(req.body);
    await book.save();

    res.status(201).json(book);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get all books with pagination and advanced filtering
export const getBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortField = (req.query.sortField as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    const filter: any = {};

    // Áp dụng các bộ lọc
    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.subCategory) {
      filter.subCategory = req.query.subCategory;
    }

    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: 'i' };
    }

    if (req.query.publisher) {
      filter.publisher = { $regex: req.query.publisher, $options: 'i' };
    }

    if (req.query.language) {
      filter.language = req.query.language;
    }

    // Lọc theo khoảng giá
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Lọc theo khoảng năm xuất bản
    if (req.query.minYear || req.query.maxYear) {
      filter.publishedYear = {};
      if (req.query.minYear) filter.publishedYear.$gte = Number(req.query.minYear);
      if (req.query.maxYear) filter.publishedYear.$lte = Number(req.query.maxYear);
    }

    // Lọc theo rating
    if (req.query.minRating) {
      filter.rating = { $gte: Number(req.query.minRating) };
    }

    // Lọc theo các trạng thái đặc biệt
    if (req.query.isFeatured === 'true') {
      filter.isFeatured = true;
    }

    if (req.query.isBestSeller === 'true') {
      filter.isBestSeller = true;
    }

    if (req.query.isNewRelease === 'true') {
      filter.isNewRelease = true;
    }

    if (req.query.isPopular === 'true') {
      filter.isPopular = true;
    }

    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Lọc theo phạm vi ngày phát hành
    if (req.query.fromDate || req.query.toDate) {
      filter.releaseDate = {};
      if (req.query.fromDate) filter.releaseDate.$gte = new Date(req.query.fromDate as string);
      if (req.query.toDate) filter.releaseDate.$lte = new Date(req.query.toDate as string);
    }

    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;

    const books = await Book.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);

    const total = await Book.countDocuments(filter);

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get single book
export const getBook = async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    res.json(book);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Update book
export const updateBook = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    res.json(book);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Delete book
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    res.json({ message: 'Xóa sách thành công' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Search books
export const searchBooks = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    let searchQuery: any = {};

    if (query) {
      searchQuery = { $text: { $search: query as string } };
    }

    const books = await Book.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } });
    
    res.json(books);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get book categories
export const getBookCategories = async (req: Request, res: Response) => {
  try {
    const categories = Object.values(BookCategory);
    res.json(categories);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get featured books
export const getFeaturedBooks = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const books = await Book.find({ isFeatured: true })
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json(books);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get best seller books
export const getBestSellerBooks = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const books = await Book.find({ isBestSeller: true })
      .limit(limit)
      .sort({ salesCount: -1 });
    
    res.json(books);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get new release books
export const getNewReleaseBooks = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const books = await Book.find({ isNewRelease: true })
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json(books);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get popular books
export const getPopularBooks = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const books = await Book.find({ isPopular: true })
      .limit(limit)
      .sort({ rating: -1 });
    
    res.json(books);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Get books by category
export const getBooksByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit as string) || 8;
    
    const books = await Book.find({ category })
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json(books);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
}; 