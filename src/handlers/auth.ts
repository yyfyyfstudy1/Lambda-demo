import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { userService } from '../services/userService';
import { validateRequest, loginSchema } from '../utils/validation';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response';
import { LoginRequest } from '../types';
import logger from '../utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.info('Auth handler invoked', { 
    httpMethod: event.httpMethod, 
    path: event.path,
    requestId: context.awsRequestId 
  });

  try {
    const { httpMethod, path } = event;

    // 处理CORS预检请求
    if (httpMethod === 'OPTIONS') {
      return successResponse({}, 200);
    }

    // 路由处理
    if (path === '/auth/login' && httpMethod === 'POST') {
      return await handleLogin(event);
    }

    if (path === '/auth/register' && httpMethod === 'POST') {
      return await handleRegister(event);
    }

    if (path === '/auth/me' && httpMethod === 'GET') {
      return await handleGetMe(event);
    }

    return errorResponse('Not Found', 404);
  } catch (error) {
    logger.error('Auth handler error:', error);
    return errorResponse('Internal Server Error', 500);
  }
};

async function handleLogin(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return validationErrorResponse('Request body is required');
    }

    const loginData: LoginRequest = JSON.parse(event.body);
    
    // 验证请求数据
    const validatedData = validateRequest<LoginRequest>(loginSchema, loginData);
    
    // 执行登录
    const result = await userService.login(validatedData);
    
    return successResponse(result);
  } catch (error) {
    logger.error('Login error:', error);
    
    if (error instanceof Error && error.message.includes('Validation error')) {
      return validationErrorResponse(error.message);
    }
    
    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      return errorResponse('Invalid email or password', 401);
    }
    
    return errorResponse('Login failed', 500);
  }
}

async function handleRegister(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return validationErrorResponse('Request body is required');
    }

    const { email, password, username } = JSON.parse(event.body);
    
    if (!email || !password || !username) {
      return validationErrorResponse('Email, password, and username are required');
    }

    // 检查用户是否已存在
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return errorResponse('User already exists', 409);
    }

    // 创建用户
    const user = await userService.createUser(email, username);
    
    return successResponse({ 
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    }, 201);
  } catch (error) {
    logger.error('Register error:', error);
    return errorResponse('Registration failed', 500);
  }
}

async function handleGetMe(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // 从Cognito JWT token中获取用户信息
    const userId = event.requestContext.authorizer?.['claims']?.['sub'];
    
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await userService.getUserById(userId);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt
    });
  } catch (error) {
    logger.error('Get me error:', error);
    return errorResponse('Failed to get user info', 500);
  }
}
