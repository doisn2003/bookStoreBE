"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Tạo danh mục mới (admin)
router.post('/', auth_middleware_1.adminAuth, [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Tên danh mục là bắt buộc'),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('image').optional(),
    (0, express_validator_1.body)('parentCategory').optional(),
], category_controller_1.createCategory);
// Lấy tất cả danh mục
router.get('/', category_controller_1.getAllCategories);
// Lấy danh mục chính (không phải danh mục con)
router.get('/main', category_controller_1.getMainCategories);
// Lấy danh mục phổ biến
router.get('/popular', category_controller_1.getPopularCategories);
// Lấy danh mục con của một danh mục
router.get('/sub/:parentId', category_controller_1.getSubCategories);
// Lấy sách theo danh mục (sử dụng slug)
router.get('/:slug/books', category_controller_1.getBooksByCategory);
// Lấy thông tin danh mục theo slug
router.get('/slug/:slug', category_controller_1.getCategoryBySlug);
// Lấy thông tin danh mục theo ID
router.get('/:id', category_controller_1.getCategoryById);
// Cập nhật danh mục (admin)
router.put('/:id', auth_middleware_1.adminAuth, [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Tên danh mục không được để trống'),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('image').optional(),
    (0, express_validator_1.body)('parentCategory').optional(),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive phải là boolean'),
    (0, express_validator_1.body)('displayOrder').optional().isNumeric().withMessage('displayOrder phải là số'),
    (0, express_validator_1.body)('featuredBooks').optional().isArray().withMessage('featuredBooks phải là mảng'),
], category_controller_1.updateCategory);
// Xóa danh mục (admin)
router.delete('/:id', auth_middleware_1.adminAuth, category_controller_1.deleteCategory);
exports.default = router;
