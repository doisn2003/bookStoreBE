# Bookstore Backend

This is the backend API for the Bookstore web application. It's built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication and authorization
- Book management (CRUD operations)
- Order management
- Search and filtering
- Pagination
- Input validation
- Error handling
- JWT-based authentication
- Role-based access control

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

### Books
- GET /api/books - Get all books (with pagination)
- GET /api/books/search - Search books
- GET /api/books/:id - Get single book
- POST /api/books - Create new book (admin only)
- PUT /api/books/:id - Update book (admin only)
- DELETE /api/books/:id - Delete book (admin only)

### Orders
- POST /api/orders - Create new order
- GET /api/orders - Get all orders (admin only)
- GET /api/orders/my-orders - Get user's orders
- GET /api/orders/:id - Get single order
- PATCH /api/orders/:id/status - Update order status (admin only)

## Error Handling

The API uses a consistent error response format:

```json
{
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## License

ISC 