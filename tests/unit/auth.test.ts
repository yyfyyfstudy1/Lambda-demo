import { handler } from '../../src/handlers/auth';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Mock dependencies
jest.mock('../../src/services/userService');
jest.mock('../../src/utils/logger');

describe('Auth Handler', () => {
  let mockEvent: Partial<APIGatewayProxyEvent>;
  let mockContext: Context;

  beforeEach(() => {
    mockEvent = {
      httpMethod: 'POST',
      path: '/auth/login',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    mockContext = {
      awsRequestId: 'test-request-id',
      functionName: 'test-function',
      functionVersion: '1',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
      memoryLimitInMB: '128',
      remainingTimeInMillis: () => 30000,
      logGroupName: '/aws/lambda/test',
      logStreamName: '2023/01/01/[$LATEST]test',
      getRemainingTimeInMillis: () => 30000,
      done: jest.fn(),
      fail: jest.fn(),
      succeed: jest.fn()
    };
  });

  describe('POST /auth/login', () => {
    it('should return success response for valid login', async () => {
      const { userService } = require('../../src/services/userService');
      userService.login.mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer'
      });

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toMatchObject({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer'
      });
    });

    it('should return error response for invalid credentials', async () => {
      const { userService } = require('../../src/services/userService');
      userService.login.mockRejectedValue(new Error('Invalid credentials'));

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toMatchObject({
        error: 'Error',
        message: 'Invalid email or password'
      });
    });

    it('should return validation error for missing body', async () => {
      mockEvent.body = undefined;

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toMatchObject({
        error: 'Validation Error',
        message: 'Request body is required'
      });
    });
  });

  describe('POST /auth/register', () => {
    beforeEach(() => {
      mockEvent.path = '/auth/register';
      mockEvent.body = JSON.stringify({
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser'
      });
    });

    it('should return success response for valid registration', async () => {
      const { userService } = require('../../src/services/userService');
      userService.getUserByEmail.mockResolvedValue(null);
      userService.createUser.mockResolvedValue({
        id: 'user-123',
        email: 'newuser@example.com',
        username: 'newuser',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      });

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(201);
      expect(JSON.parse(result.body)).toMatchObject({
        message: 'User created successfully',
        user: {
          id: 'user-123',
          email: 'newuser@example.com',
          username: 'newuser'
        }
      });
    });

    it('should return error for existing user', async () => {
      const { userService } = require('../../src/services/userService');
      userService.getUserByEmail.mockResolvedValue({
        id: 'existing-user',
        email: 'newuser@example.com',
        username: 'existinguser'
      });

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(409);
      expect(JSON.parse(result.body)).toMatchObject({
        error: 'Error',
        message: 'User already exists'
      });
    });
  });
});
