"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/register')
                .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });
        it('should not register user with existing email', async () => {
            // First registration
            await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/register')
                .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
            // Second registration with same email
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/register')
                .send({
                name: 'Test User 2',
                email: 'test@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });
    });
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/register')
                .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
        });
        it('should login with valid credentials', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });
        it('should not login with invalid password', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'wrongpassword',
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });
    describe('POST /api/auth/forgot-password', () => {
        beforeEach(async () => {
            await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/register')
                .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
        });
        it('should send reset email for existing user', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/forgot-password')
                .send({
                email: 'test@example.com',
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Password reset email sent');
        });
        it('should not send reset email for non-existing user', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/forgot-password')
                .send({
                email: 'nonexistent@example.com',
            });
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'User not found');
        });
    });
});
