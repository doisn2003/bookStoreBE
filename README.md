# Bookstore Backend

This is the backend API for the Bookstore web application. It's built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication and authorization with JWT
- Email verification
- Password reset functionality
- Book management (CRUD operations)
- Category management with hierarchical structure
- Order management with status tracking
- Shopping cart functionality
- Featured books and collections
- Best sellers and new releases
- Advanced search and filtering
- Pagination
- Input validation
- Error handling
- Role-based access control (Admin/User)
- Ethereum payment integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bookstore
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

## Development

To run the development server:

```bash
npm run dev
```

The server will start on http://localhost:5000 (or the port specified in your .env file).

## Building for Production

To build the TypeScript code:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update user profile
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password with token
- POST /api/auth/verify-email - Verify email address

### Books
- GET /api/books - Get all books (with pagination and filtering)
- GET /api/books/search - Search books
- GET /api/books/featured - Get featured books
- GET /api/books/best-sellers - Get best selling books
- GET /api/books/new-releases - Get new release books
- GET /api/books/popular - Get popular books
- GET /api/books/category/:category - Get books by category
- GET /api/books/:id - Get single book
- POST /api/books - Create new book (admin only)
- PUT /api/books/:id - Update book (admin only)
- DELETE /api/books/:id - Delete book (admin only)

### Categories
- GET /api/categories - Get all categories
- GET /api/categories/main - Get main categories
- GET /api/categories/popular - Get popular categories
- GET /api/categories/sub/:parentId - Get subcategories
- GET /api/categories/:slug/books - Get books by category slug
- GET /api/categories/slug/:slug - Get category by slug
- GET /api/categories/:id - Get category by ID
- POST /api/categories - Create new category (admin only)
- PUT /api/categories/:id - Update category (admin only)
- DELETE /api/categories/:id - Delete category (admin only)

### Orders
- POST /api/orders - Create new order
- GET /api/orders - Get all orders (admin only)
- GET /api/orders/my-orders - Get user's orders
- GET /api/orders/:id - Get single order
- PATCH /api/orders/:id/status - Update order status (admin only)

### NFTs (Blockchain Integration)
- GET /api/nfts - Get all NFTs
- GET /api/nfts/:id - Get single NFT
- POST /api/nfts - Create new NFT (authenticated)
- PUT /api/nfts/:id - Update NFT (authenticated)
- DELETE /api/nfts/:id - Delete NFT (authenticated)

## Ethereum Payment Integration

The application includes Ethereum blockchain integration for payments. For detailed information about the payment system:

- See `PAYMENT_SYSTEM_OVERVIEW.md` for system architecture
- See `ETHEREUM_PAYMENT_GUIDE.md` for implementation details
- See `PAYMENT_README.md` for setup instructions

### Smart Contract
The project uses a custom smart contract (`BookPayment.sol`) for handling payments. The contract is deployed using Hardhat and can be found in the `ethereum/contracts` directory.

### Payment Demo
A demo implementation of the Ethereum payment system is available at:
- `/public/eth-payment-demo.html` - Demo interface
- `/public/eth-payment-client.js` - Client-side integration code

For testing the payment API endpoints, refer to the Postman collection: `bookstore-payment-api.postman_collection.json`

## Environment Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bookstore
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ETH_NETWORK=localhost
   ETH_ACCOUNT_PRIVATE_KEY=your-ethereum-private-key
   SMART_CONTRACT_ADDRESS=your-deployed-contract-address
   ```

## Error Handling

The API uses a consistent error response format:

```json
{
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## License

ISC