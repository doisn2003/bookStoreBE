"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrder = exports.getUserOrders = exports.getOrders = exports.createOrder = void 0;
const express_validator_1 = require("express-validator");
const order_model_1 = require("../models/order.model");
const book_model_1 = require("../models/book.model");
// Create new order
const createOrder = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { items, shippingAddress, paymentMethod } = req.body;
        let totalAmount = 0;
        // Calculate total amount and verify stock
        for (const item of items) {
            const book = await book_model_1.Book.findById(item.book);
            if (!book) {
                return res.status(404).json({ message: `Book not found: ${item.book}` });
            }
            if (book.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for book: ${book.title}` });
            }
            totalAmount += book.price * item.quantity;
        }
        // Create order
        const order = new order_model_1.Order({
            user: req.user._id,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
        });
        // Update book stock
        for (const item of items) {
            await book_model_1.Book.findByIdAndUpdate(item.book, {
                $inc: { stock: -item.quantity },
            });
        }
        await order.save();
        res.status(201).json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createOrder = createOrder;
// Get all orders (admin)
const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const orders = await order_model_1.Order.find()
            .populate('user', 'name email')
            .populate('items.book', 'title author price')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await order_model_1.Order.countDocuments();
        res.json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getOrders = getOrders;
// Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const orders = await order_model_1.Order.find({ user: req.user._id })
            .populate('items.book', 'title author price coverImage')
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserOrders = getUserOrders;
// Get single order
const getOrder = async (req, res) => {
    try {
        const order = await order_model_1.Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.book', 'title author price coverImage');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Check if user is admin or order owner
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getOrder = getOrder;
// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { status } = req.body;
        const order = await order_model_1.Order.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
