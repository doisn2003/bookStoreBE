"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = exports.generateTestToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const generateTestToken = (user) => {
    return jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
};
exports.generateTestToken = generateTestToken;
const createTestUser = async () => {
    const user = new user_model_1.User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    });
    await user.save();
    return user;
};
exports.createTestUser = createTestUser;
