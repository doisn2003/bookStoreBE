"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBooks = exports.deleteBook = exports.updateBook = exports.getBook = exports.getBooks = exports.createBook = void 0;
const express_validator_1 = require("express-validator");
const book_model_1 = require("../models/book.model");
// Create a new book
const createBook = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const book = new book_model_1.Book(req.body);
        await book.save();
        res.status(201).json(book);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createBook = createBook;
// Get all books with pagination
const getBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const books = await book_model_1.Book.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await book_model_1.Book.countDocuments();
        res.json({
            books,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBooks: total,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getBooks = getBooks;
// Get single book
const getBook = async (req, res) => {
    try {
        const book = await book_model_1.Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getBook = getBook;
// Update book
const updateBook = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const book = await book_model_1.Book.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateBook = updateBook;
// Delete book
const deleteBook = async (req, res) => {
    try {
        const book = await book_model_1.Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteBook = deleteBook;
// Search books
const searchBooks = async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice } = req.query;
        const searchQuery = {};
        if (query) {
            searchQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ];
        }
        if (category) {
            searchQuery.category = category;
        }
        if (minPrice || maxPrice) {
            searchQuery.price = {};
            if (minPrice)
                searchQuery.price.$gte = Number(minPrice);
            if (maxPrice)
                searchQuery.price.$lte = Number(maxPrice);
        }
        const books = await book_model_1.Book.find(searchQuery).sort({ createdAt: -1 });
        res.json(books);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.searchBooks = searchBooks;
