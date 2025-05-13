"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const book_controller_1 = require("../controllers/book.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Create book (admin only)
router.post('/', auth_middleware_1.adminAuth, [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Tiêu đề là bắt buộc'),
    (0, express_validator_1.body)('author').notEmpty().withMessage('Tác giả là bắt buộc'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Mô tả là bắt buộc'),
    (0, express_validator_1.body)('price').isNumeric().withMessage('Giá phải là số'),
    (0, express_validator_1.body)('imageUrl').notEmpty().withMessage('Ảnh bìa là bắt buộc'),
    (0, express_validator_1.body)('category').notEmpty().withMessage('Danh mục là bắt buộc'),
    (0, express_validator_1.body)('discount').optional().isNumeric().withMessage('Giảm giá phải là số'),
    (0, express_validator_1.body)('rating').optional().isNumeric().withMessage('Đánh giá phải là số'),
    (0, express_validator_1.body)('language').optional(),
    (0, express_validator_1.body)('pages').optional().isNumeric().withMessage('Số trang phải là số'),
    (0, express_validator_1.body)('publisher').optional(),
    (0, express_validator_1.body)('publishedDate').optional(),
    (0, express_validator_1.body)('stock').optional().isNumeric().withMessage('Số lượng phải là số'),
    (0, express_validator_1.body)('isbn').optional(),
], book_controller_1.createBook);
// Get all books with filtering
router.get('/', book_controller_1.getBooks);
// Get book categories
router.get('/categories', book_controller_1.getBookCategories);
// Get featured books
router.get('/featured', book_controller_1.getFeaturedBooks);
// Get best seller books
router.get('/best-sellers', book_controller_1.getBestSellerBooks);
// Get new release books
router.get('/new-releases', book_controller_1.getNewReleaseBooks);
// Get popular books
router.get('/popular', book_controller_1.getPopularBooks);
// Get books by category
router.get('/category/:category', book_controller_1.getBooksByCategory);
// Search books
router.get('/search', book_controller_1.searchBooks);
// Get single book
router.get('/:id', book_controller_1.getBook);
// Update book (admin only)
router.put('/:id', auth_middleware_1.adminAuth, [
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Tiêu đề không được để trống'),
    (0, express_validator_1.body)('author').optional().notEmpty().withMessage('Tác giả không được để trống'),
    (0, express_validator_1.body)('description').optional().notEmpty().withMessage('Mô tả không được để trống'),
    (0, express_validator_1.body)('price').optional().isNumeric().withMessage('Giá phải là số'),
    (0, express_validator_1.body)('imageUrl').optional().notEmpty().withMessage('Ảnh bìa không được để trống'),
    (0, express_validator_1.body)('category').optional().notEmpty().withMessage('Danh mục không được để trống'),
    (0, express_validator_1.body)('discount').optional().isNumeric().withMessage('Giảm giá phải là số'),
    (0, express_validator_1.body)('rating').optional().isNumeric().withMessage('Đánh giá phải là số'),
    (0, express_validator_1.body)('language').optional(),
    (0, express_validator_1.body)('pages').optional().isNumeric().withMessage('Số trang phải là số'),
    (0, express_validator_1.body)('publisher').optional(),
    (0, express_validator_1.body)('publishedDate').optional(),
    (0, express_validator_1.body)('stock').optional().isNumeric().withMessage('Số lượng phải là số'),
    (0, express_validator_1.body)('isbn').optional(),
    (0, express_validator_1.body)('isFeatured').optional().isBoolean().withMessage('isFeatured phải là boolean'),
    (0, express_validator_1.body)('isBestSeller').optional().isBoolean().withMessage('isBestSeller phải là boolean'),
    (0, express_validator_1.body)('isNewRelease').optional().isBoolean().withMessage('isNewRelease phải là boolean'),
    (0, express_validator_1.body)('isPopular').optional().isBoolean().withMessage('isPopular phải là boolean'),
    (0, express_validator_1.body)('salesCount').optional().isNumeric().withMessage('salesCount phải là số'),
], book_controller_1.updateBook);
// Delete book (admin only)
router.delete('/:id', auth_middleware_1.adminAuth, book_controller_1.deleteBook);
exports.default = router;
