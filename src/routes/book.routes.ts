import express from 'express';
import { body } from 'express-validator';
import {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  searchBooks,
  getBookCategories,
  getFeaturedBooks,
  getBestSellerBooks,
  getNewReleaseBooks,
  getPopularBooks,
  getBooksByCategory,
  updateAllBooksStock
} from '../controllers/book.controller';
import { auth, adminAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Create book (admin only)
router.post(
  '/',
  adminAuth,
  [
    body('title').notEmpty().withMessage('Tiêu đề là bắt buộc'),
    body('author').notEmpty().withMessage('Tác giả là bắt buộc'),
    body('description').notEmpty().withMessage('Mô tả là bắt buộc'),
    body('price').isNumeric().withMessage('Giá phải là số'),
    body('imageUrl').notEmpty().withMessage('Ảnh bìa là bắt buộc'),
    body('category').notEmpty().withMessage('Danh mục là bắt buộc'),
    body('discount').optional().isNumeric().withMessage('Giảm giá phải là số'),
    body('rating').optional().isNumeric().withMessage('Đánh giá phải là số'),
    body('language').optional(),
    body('pages').optional().isNumeric().withMessage('Số trang phải là số'),
    body('publisher').optional(),
    body('publishedDate').optional(),
    body('stock').optional().isNumeric().withMessage('Số lượng phải là số'),
    body('isbn').optional(),
  ],
  createBook
);

// Get all books with filtering
router.get('/', getBooks);

// Get book categories
router.get('/categories', getBookCategories);

// Get featured books
router.get('/featured', getFeaturedBooks);

// Get best seller books
router.get('/best-sellers', getBestSellerBooks);

// Get new release books
router.get('/new-releases', getNewReleaseBooks);

// Get popular books
router.get('/popular', getPopularBooks);

// Get books by category
router.get('/category/:category', getBooksByCategory);

// Search books
router.get('/search', searchBooks);

// Get single book
router.get('/:id', getBook);

// Update book (admin only)
router.put(
  '/:id',
  adminAuth,
  [
    body('title').optional().notEmpty().withMessage('Tiêu đề không được để trống'),
    body('author').optional().notEmpty().withMessage('Tác giả không được để trống'),
    body('description').optional().notEmpty().withMessage('Mô tả không được để trống'),
    body('price').optional().isNumeric().withMessage('Giá phải là số'),
    body('imageUrl').optional().notEmpty().withMessage('Ảnh bìa không được để trống'),
    body('category').optional().notEmpty().withMessage('Danh mục không được để trống'),
    body('discount').optional().isNumeric().withMessage('Giảm giá phải là số'),
    body('rating').optional().isNumeric().withMessage('Đánh giá phải là số'),
    body('language').optional(),
    body('pages').optional().isNumeric().withMessage('Số trang phải là số'),
    body('publisher').optional(),
    body('publishedDate').optional(),
    body('stock').optional().isNumeric().withMessage('Số lượng phải là số'),
    body('isbn').optional(),
    body('isFeatured').optional().isBoolean().withMessage('isFeatured phải là boolean'),
    body('isBestSeller').optional().isBoolean().withMessage('isBestSeller phải là boolean'),
    body('isNewRelease').optional().isBoolean().withMessage('isNewRelease phải là boolean'),
    body('isPopular').optional().isBoolean().withMessage('isPopular phải là boolean'),
    body('salesCount').optional().isNumeric().withMessage('salesCount phải là số'),
  ],
  updateBook
);

// Delete book (admin only)
router.delete('/:id', adminAuth, deleteBook);

// Cập nhật số lượng cho tất cả sách (admin only)
router.post(
  '/update-all-stock',
  //adminAuth,
  [
    body('stock').isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên dương'),
  ],
  updateAllBooksStock
);

export default router; 