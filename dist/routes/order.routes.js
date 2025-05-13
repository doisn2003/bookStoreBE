"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Create order
router.post('/', auth_middleware_1.auth, [
    (0, express_validator_1.body)('items').isArray().withMessage('Items must be an array'),
    (0, express_validator_1.body)('items.*.book').notEmpty().withMessage('Book ID is required'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('shippingAddress').isObject().withMessage('Shipping address is required'),
    (0, express_validator_1.body)('shippingAddress.street').notEmpty().withMessage('Street is required'),
    (0, express_validator_1.body)('shippingAddress.city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('shippingAddress.state').notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('shippingAddress.country').notEmpty().withMessage('Country is required'),
    (0, express_validator_1.body)('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
    (0, express_validator_1.body)('paymentMethod').notEmpty().withMessage('Payment method is required'),
], order_controller_1.createOrder);
// Get all orders (admin only)
router.get('/', auth_middleware_1.adminAuth, order_controller_1.getOrders);
// Get user's orders
router.get('/my-orders', auth_middleware_1.auth, order_controller_1.getUserOrders);
// Get single order
router.get('/:id', auth_middleware_1.auth, order_controller_1.getOrder);
// Update order status (admin only)
router.patch('/:id/status', auth_middleware_1.adminAuth, [
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid status'),
], order_controller_1.updateOrderStatus);
exports.default = router;
