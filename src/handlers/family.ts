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
    const userId = event.requestContext.authorizer?.['claims']?.['sub'];
    if (!userId) {
      return unauthorizedResponse('Authentication required');
    }

    // 路由处理
    if (path === '/family' && httpMethod === 'POST') {
      return await handleCreateFamily(event, userId);
    }

    if (path === '/family' && httpMethod === 'GET') {
      return await handleGetFamilies(event, userId);
    }

    if (path.startsWith('/family/') && httpMethod === 'GET') {
      return await handleGetFamily(event, userId);
    }

    if (path.startsWith('/family/') && httpMethod === 'PUT') {
      return await handleUpdateFamily(event, userId);
    }

    if (path.startsWith('/family/') && httpMethod === 'DELETE') {
      return await handleDeleteFamily(event, userId);
    }

    if (path.startsWith('/family/') && path.endsWith('/members') && httpMethod === 'POST') {
      return await handleAddMember(event, userId);
    }

    if (path.startsWith('/family/') && path.includes('/members/') && httpMethod === 'DELETE') {
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
