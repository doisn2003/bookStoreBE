"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Get all NFTs
router.get('/', async (req, res) => {
    try {
        // TODO: Implement get all NFTs
        res.json({ message: 'Get all NFTs - Not implemented yet' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Get single NFT
router.get('/:id', async (req, res) => {
    try {
        // TODO: Implement get single NFT
        res.json({ message: 'Get single NFT - Not implemented yet' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Create NFT (protected route)
router.post('/', auth_middleware_1.auth, [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('price').isNumeric().withMessage('Price must be a number'),
    (0, express_validator_1.body)('imageUrl').isURL().withMessage('Valid image URL is required'),
], async (req, res) => {
    try {
        // TODO: Implement create NFT
        res.status(201).json({ message: 'Create NFT - Not implemented yet' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Update NFT (protected route)
router.put('/:id', auth_middleware_1.auth, [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Name cannot be empty'),
    (0, express_validator_1.body)('description').optional().notEmpty().withMessage('Description cannot be empty'),
    (0, express_validator_1.body)('price').optional().isNumeric().withMessage('Price must be a number'),
    (0, express_validator_1.body)('imageUrl').optional().isURL().withMessage('Valid image URL is required'),
], async (req, res) => {
    try {
        // TODO: Implement update NFT
        res.json({ message: 'Update NFT - Not implemented yet' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Delete NFT (protected route)
router.delete('/:id', auth_middleware_1.auth, async (req, res) => {
    try {
        // TODO: Implement delete NFT
        res.json({ message: 'Delete NFT - Not implemented yet' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
