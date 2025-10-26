import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { familyService } from '../services/familyService';
import { validateRequest, createFamilySchema, updateFamilySchema } from '../utils/validation';
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse, unauthorizedResponse } from '../utils/response';
import { CreateFamilyRequest, UpdateFamilyRequest, FamilyMember } from '../types';
import logger from '../utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.info('Family handler invoked', { 
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

    // 获取用户ID
    // 本地开发时使用测试用户ID，生产环境从 Cognito 获取
    let userId = event.requestContext.authorizer?.['claims']?.['sub'];
    
    // 如果是本地环境且没有用户ID，使用测试ID
    if (!userId) {
      const stage = process.env['STAGE'] || 'dev';
      if (stage === 'local') {
        userId = 'test-user-id-12345'; // 本地测试用户
        logger.info('Using test user ID for local development', { userId });
      } else {
        return unauthorizedResponse('Authentication required');
      }
    }

    // 路由处理 - 规范化路径（移除stage前缀，如果存在）
    // path可能是 /family 或 /dev/family
    let cleanPath = path;
    if (!cleanPath.startsWith('/family')) {
      // 如果不是以/family开始，说明有stage前缀，移除第一段
      cleanPath = cleanPath.replace(/^\/[^\/]+/, '');
    }
    
    if (cleanPath === '/family' && httpMethod === 'POST') {
      return await handleCreateFamily(event, userId);
    }

    if (cleanPath === '/family' && httpMethod === 'GET') {
      return await handleGetFamilies(event, userId);
    }

    if (cleanPath.startsWith('/family/') && httpMethod === 'GET') {
      return await handleGetFamily(event, userId);
    }

    if (cleanPath.startsWith('/family/') && httpMethod === 'PUT') {
      return await handleUpdateFamily(event, userId);
    }

    if (cleanPath.startsWith('/family/') && httpMethod === 'DELETE') {
      return await handleDeleteFamily(event, userId);
    }

    if (cleanPath.startsWith('/family/') && cleanPath.endsWith('/members') && httpMethod === 'POST') {
      return await handleAddMember(event, userId);
    }

    if (cleanPath.startsWith('/family/') && cleanPath.includes('/members/') && httpMethod === 'DELETE') {
      return await handleRemoveMember(event, userId);
    }

    return errorResponse('Not Found', 404);
  } catch (error) {
    logger.error('Family handler error:', error);
    return errorResponse('Internal Server Error', 500);
  }
};

async function handleCreateFamily(event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return validationErrorResponse('Request body is required');
    }

    const familyData: CreateFamilyRequest = JSON.parse(event.body);
    
    // 验证请求数据
    const validatedData = validateRequest<CreateFamilyRequest>(createFamilySchema, familyData);
    
    // 创建family
    const family = await familyService.createFamily(userId, validatedData);
    
    return successResponse(family, 201);
  } catch (error) {
    logger.error('Create family error:', error);
    
    if (error instanceof Error && error.message.includes('Validation error')) {
      return validationErrorResponse(error.message);
    }
    
    return errorResponse('Failed to create family', 500);
  }
}

async function handleGetFamilies(_event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> {
  try {
    const families = await familyService.getFamiliesByUserId(userId);
    return successResponse(families);
  } catch (error) {
    logger.error('Get families error:', error);
    return errorResponse('Failed to get families', 500);
  }
}

async function handleGetFamily(event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> {
  try {
    const familyId = event.pathParameters?.['id'];
    if (!familyId) {
      return validationErrorResponse('Family ID is required');
    }

    const family = await familyService.getFamilyById(familyId, userId);
    
    if (!family) {
      return notFoundResponse('Family not found');
    }

    return successResponse(family);
  } catch (error) {
    logger.error('Get family error:', error);
    return errorResponse('Failed to get family', 500);
  }
}

async function handleUpdateFamily(event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> {
  try {
    const familyId = event.pathParameters?.['id'];
    if (!familyId) {
      return validationErrorResponse('Family ID is required');
    }

    if (!event.body) {
      return validationErrorResponse('Request body is required');
    }

    const updateData: UpdateFamilyRequest = JSON.parse(event.body);
    
    // 验证请求数据
    const validatedData = validateRequest<UpdateFamilyRequest>(updateFamilySchema, updateData);
    
    // 更新family
    const family = await familyService.updateFamily(familyId, userId, validatedData);
    
    return successResponse(family);
  } catch (error) {
    logger.error('Update family error:', error);
    
    if (error instanceof Error && error.message.includes('Validation error')) {
      return validationErrorResponse(error.message);
    }
    
    if (error instanceof Error && error.message.includes('Family not found')) {
      return notFoundResponse('Family not found or access denied');
    }
    
    return errorResponse('Failed to update family', 500);
  }
}

async function handleDeleteFamily(event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> {
  try {
    const familyId = event.pathParameters?.['id'];
    if (!familyId) {
      return validationErrorResponse('Family ID is required');
    }

    await familyService.deleteFamily(familyId, userId);
    
    return successResponse({ message: 'Family deleted successfully' });
  } catch (error) {
    logger.error('Delete family error:', error);
    
    if (error instanceof Error && error.message.includes('Family not found')) {
      return notFoundResponse('Family not found or access denied');
    }
    
    return errorResponse('Failed to delete family', 500);
  }
}

async function handleAddMember(event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> {
  try {
    const familyId = event.pathParameters?.['id'];
    if (!familyId) {
      return validationErrorResponse('Family ID is required');
    }

    if (!event.body) {
      return validationErrorResponse('Request body is required');
    }

    const memberData: Omit<FamilyMember, 'id'> = JSON.parse(event.body);
    
    if (!memberData.name || !memberData.relationship) {
      return validationErrorResponse('Name and relationship are required');
    }

    const family = await familyService.addFamilyMember(familyId, userId, memberData);
    
    return successResponse(family);
  } catch (error) {
    logger.error('Add member error:', error);
    
    if (error instanceof Error && error.message.includes('Family not found')) {
      return notFoundResponse('Family not found or access denied');
    }
    
    return errorResponse('Failed to add member', 500);
  }
}

async function handleRemoveMember(event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> {
  try {
    const familyId = event.pathParameters?.['id'];
    const memberId = event.pathParameters?.['memberId'];
    
    if (!familyId || !memberId) {
      return validationErrorResponse('Family ID and Member ID are required');
    }

    const family = await familyService.removeFamilyMember(familyId, userId, memberId);
    
    return successResponse(family);
  } catch (error) {
    logger.error('Remove member error:', error);
    
    if (error instanceof Error && error.message.includes('Family not found')) {
      return notFoundResponse('Family not found or access denied');
    }
    
    return errorResponse('Failed to remove member', 500);
  }
}
