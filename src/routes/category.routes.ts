import express from 'express';
import { body } from 'express-validator';
import {
  createCategory,
  getAllCategories,
  getMainCategories,
  getSubCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getBooksByCategory,
  getPopularCategories
} from '../controllers/category.controller';
import { adminAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Tạo danh mục mới (admin)
router.post(
  '/',
  adminAuth,
  [
    body('name').notEmpty().withMessage('Tên danh mục là bắt buộc'),
    body('description').optional(),
    body('image').optional(),
    body('parentCategory').optional(),
  ],
  createCategory
);

// Lấy tất cả danh mục
router.get('/', getAllCategories);

// Lấy danh mục chính (không phải danh mục con)
router.get('/main', getMainCategories);

// Lấy danh mục phổ biến
router.get('/popular', getPopularCategories);

// Lấy danh mục con của một danh mục
router.get('/sub/:parentId', getSubCategories);

// Lấy sách theo danh mục (sử dụng slug)
router.get('/:slug/books', getBooksByCategory);

// Lấy thông tin danh mục theo slug
router.get('/slug/:slug', getCategoryBySlug);

// Lấy thông tin danh mục theo ID
router.get('/:id', getCategoryById);

// Cập nhật danh mục (admin)
router.put(
  '/:id',
  adminAuth,
  [
    body('name').optional().notEmpty().withMessage('Tên danh mục không được để trống'),
    body('description').optional(),
    body('image').optional(),
    body('parentCategory').optional(),
    body('isActive').optional().isBoolean().withMessage('isActive phải là boolean'),
    body('displayOrder').optional().isNumeric().withMessage('displayOrder phải là số'),
    body('featuredBooks').optional().isArray().withMessage('featuredBooks phải là mảng'),
  ],
  updateCategory
);

// Xóa danh mục (admin)
router.delete('/:id', adminAuth, deleteCategory);

export default router; 