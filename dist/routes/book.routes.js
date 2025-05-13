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
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('author').notEmpty().withMessage('Author is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('price').isNumeric().withMessage('Price must be a number'),
    (0, express_validator_1.body)('coverImage').notEmpty().withMessage('Cover image is required'),
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('stock').isNumeric().withMessage('Stock must be a number'),
    (0, express_validator_1.body)('isbn').notEmpty().withMessage('ISBN is required'),
    (0, express_validator_1.body)('publishedYear').isNumeric().withMessage('Published year must be a number'),
], book_controller_1.createBook);
// Get all books
router.get('/', book_controller_1.getBooks);
// Search books
router.get('/search', book_controller_1.searchBooks);
// Get single book
router.get('/:id', book_controller_1.getBook);
// Update book (admin only)
router.put('/:id', auth_middleware_1.adminAuth, [
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Title cannot be empty'),
    (0, express_validator_1.body)('author').optional().notEmpty().withMessage('Author cannot be empty'),
    (0, express_validator_1.body)('description').optional().notEmpty().withMessage('Description cannot be empty'),
    (0, express_validator_1.body)('price').optional().isNumeric().withMessage('Price must be a number'),
    (0, express_validator_1.body)('coverImage').optional().notEmpty().withMessage('Cover image cannot be empty'),
    (0, express_validator_1.body)('category').optional().notEmpty().withMessage('Category cannot be empty'),
    (0, express_validator_1.body)('stock').optional().isNumeric().withMessage('Stock must be a number'),
    (0, express_validator_1.body)('isbn').optional().notEmpty().withMessage('ISBN cannot be empty'),
    (0, express_validator_1.body)('publishedYear').optional().isNumeric().withMessage('Published year must be a number'),
], book_controller_1.updateBook);
// Delete book (admin only)
router.delete('/:id', auth_middleware_1.adminAuth, book_controller_1.deleteBook);
exports.default = router;
