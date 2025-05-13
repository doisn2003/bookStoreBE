"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Register route
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
], auth_controller_1.register);
// Login route
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], auth_controller_1.login);
// Get profile route
router.get('/profile', auth_middleware_1.auth, auth_controller_1.getProfile);
// Update profile route
router.put('/profile', auth_middleware_1.auth, [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Name cannot be empty'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Please enter a valid email'),
], auth_controller_1.updateProfile);
// Forgot password route
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
], auth_controller_1.forgotPassword);
// Reset password route
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
], auth_controller_1.resetPassword);
// Verify email route
router.post('/verify-email', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Token is required'),
], auth_controller_1.verifyEmail);
exports.default = router;
