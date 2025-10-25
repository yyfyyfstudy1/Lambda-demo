import { handler } from '../../src/handlers/family';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Mock dependencies
jest.mock('../../src/services/familyService');
jest.mock('../../src/utils/logger');

describe('Family Handler', () => {
  let mockEvent: Partial<APIGatewayProxyEvent>;
  let mockContext: Context;

  beforeEach(() => {
    mockEvent = {
      httpMethod: 'POST',
      path: '/family',
      body: JSON.stringify({
        name: 'Smith Family',
        description: 'The Smith family',
        members: [
          {
            name: 'John Smith',
            relationship: 'Father',
            age: 35,
            email: 'john@example.com'
          },
          {
            name: 'Jane Smith',
            relationship: 'Mother',
            age: 32,
            email: 'jane@example.com'
          }
        ]
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      requestContext: {
        authorizer: {
          claims: {
            sub: 'user-123',
            email: 'user@example.com',
            'cognito:username': 'user123'
          }
        }
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

  describe('POST /family', () => {
    it('should return success response for valid family creation', async () => {
      const { familyService } = require('../../src/services/familyService');
      familyService.createFamily.mockResolvedValue({
        id: 'family-123',
        userId: 'user-123',
        name: 'Smith Family',
        description: 'The Smith family',
        members: [
          {
            id: 'member-1',
            name: 'John Smith',
            relationship: 'Father',
            age: 35,
            email: 'john@example.com'
          }
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      });

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(201);
      expect(JSON.parse(result.body)).toMatchObject({
        id: 'family-123',
        userId: 'user-123',
        name: 'Smith Family'
      });
    });

    it('should return validation error for invalid data', async () => {
      mockEvent.body = JSON.stringify({
        name: '', // Invalid: empty name
        members: [] // Invalid: empty members
      });

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toMatchObject({
        error: 'Validation Error'
      });
    });

    it('should return unauthorized for missing auth', async () => {
      mockEvent.requestContext = {};

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toMatchObject({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    });
  });

  describe('GET /family', () => {
    beforeEach(() => {
      mockEvent.httpMethod = 'GET';
      mockEvent.path = '/family';
      mockEvent.body = undefined;
    });

    it('should return user families', async () => {
      const { familyService } = require('../../src/services/familyService');
      familyService.getFamiliesByUserId.mockResolvedValue([
        {
          id: 'family-1',
          userId: 'user-123',
          name: 'Family 1',
          members: []
        },
        {
          id: 'family-2',
          userId: 'user-123',
          name: 'Family 2',
          members: []
        }
      ]);

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body).toHaveLength(2);
      expect(body[0]).toMatchObject({
        id: 'family-1',
        name: 'Family 1'
      });
    });
  });

  describe('GET /family/{id}', () => {
    beforeEach(() => {
      mockEvent.httpMethod = 'GET';
      mockEvent.path = '/family/family-123';
      mockEvent.pathParameters = { id: 'family-123' };
      mockEvent.body = undefined;
    });

    it('should return specific family', async () => {
      const { familyService } = require('../../src/services/familyService');
      familyService.getFamilyById.mockResolvedValue({
        id: 'family-123',
        userId: 'user-123',
        name: 'Smith Family',
        members: []
      });

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toMatchObject({
        id: 'family-123',
        name: 'Smith Family'
      });
    });

    it('should return 404 for non-existent family', async () => {
      const { familyService } = require('../../src/services/familyService');
      familyService.getFamilyById.mockResolvedValue(null);

      const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toMatchObject({
        error: 'Not Found',
        message: 'Family not found'
      });
    });
  });
});
