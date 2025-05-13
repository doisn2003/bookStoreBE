"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const nft_routes_1 = __importDefault(require("./routes/nft.routes"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)('dev'));
// Database connection
mongoose_1.default
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nftshop')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
// Routes
exports.app.use('/api/auth', auth_routes_1.default);
exports.app.use('/api/nfts', nft_routes_1.default);
// Error handling middleware
exports.app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
// Only start the server if this file is run directly
if (require.main === module) {
    exports.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
