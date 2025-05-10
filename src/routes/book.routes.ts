import express from 'express';
import { body } from 'express-validator';
import {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  searchBooks,
} from '../controllers/book.controller';
import { auth, adminAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Create book (admin only)
router.post(
  '/',
  adminAuth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('coverImage').notEmpty().withMessage('Cover image is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('stock').isNumeric().withMessage('Stock must be a number'),
    body('isbn').notEmpty().withMessage('ISBN is required'),
    body('publishedYear').isNumeric().withMessage('Published year must be a number'),
  ],
  createBook
);

// Get all books
router.get('/', getBooks);

// Search books
router.get('/search', searchBooks);

// Get single book
router.get('/:id', getBook);

// Update book (admin only)
router.put(
  '/:id',
  adminAuth,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().notEmpty().withMessage('Author cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('coverImage').optional().notEmpty().withMessage('Cover image cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('stock').optional().isNumeric().withMessage('Stock must be a number'),
    body('isbn').optional().notEmpty().withMessage('ISBN cannot be empty'),
    body('publishedYear').optional().isNumeric().withMessage('Published year must be a number'),
  ],
  updateBook
);

// Delete book (admin only)
router.delete('/:id', adminAuth, deleteBook);

export default router; 