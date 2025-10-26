import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import logger from '../utils/logger';
import {errorResponse, successResponse, unauthorizedResponse, validationErrorResponse} from '../utils/response';
import {routeService} from "../services/routeService";

/**
 * Route Lambda Handler
 * 处理路由相关的 API 请求
 */
export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        logger.info('Route handler invoked', {
            httpMethod: event.httpMethod,
            path: event.path,
            requestId: event.requestContext.requestId
        });

        // 获取 HTTP 方法和路径
        const httpMethod = event.httpMethod;
        const path = event.path;

        // 路由处理
        switch (httpMethod) {
            case 'GET':
                return await handleGet(event);
            case 'POST':
                return await handlePost(event);
            case 'PUT':
                return await handlePut(event);
            case 'DELETE':
                return await handleDelete(event);
            default:
                return errorResponse(`Method ${httpMethod} not allowed`, 405);
        }
    } catch (error) {
        logger.error('Route handler error:', error);
        return errorResponse('Internal Server Error', 500);
    }
};

/**
 * 处理 GET 请求
 */
async function handleGet(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        logger.info('Handling GET request', {path: event.path});


        // 实现 GET 逻辑

        const {httpMethod, path} = event;
        // 处理CORS预检请求
        if (httpMethod === 'OPTIONS') {
            return successResponse({}, 200);
        }

        // 获取用户ID
        // 本地开发时使用测试用户ID，生产环境从 Cognito 获取
        let userId = event.requestContext.authorizer?.['claims']?.['sub'];

        if (!userId) {
            const stage = process.env['STAGE'] || 'dev';
            if (stage === 'local') {
                userId = 'test-user-id-12345'; // 本地测试用户
                logger.info('Using test user ID for local development', {userId});
            } else {
                return unauthorizedResponse('Authentication required');
            }
        }

        // get routes by familyID

        const familyId = event.pathParameters?.['id'];
        if (!familyId) {
            return validationErrorResponse('Family ID is required');
        }
        const data = await routeService.getRoutesById(familyId);

        return successResponse(data);
    } catch (error) {
        logger.error('GET handler error:', error);
        return errorResponse('Failed to handle GET request', 500);
    }
}



/**
 * 处理 POST 请求
 */
async function handlePost(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        logger.info('Handling POST request', {path: event.path});

        // 解析请求体
        if (!event.body) {
            return errorResponse('Request body is required', 400);
        }

        const requestData = JSON.parse(event.body);
        logger.info('Request data:', requestData);

        // TODO: 实现 POST 逻辑
        const result = {
            message: 'POST request handled',
            receivedData: requestData,
            timestamp: new Date().toISOString()
        };

        return successResponse(result, 201);
    } catch (error) {
        logger.error('POST handler error:', error);
        return errorResponse('Failed to handle POST request', 500);
    }
}

/**
 * 处理 PUT 请求
 */
async function handlePut(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        logger.info('Handling PUT request', {path: event.path});

        // TODO: 实现 PUT 逻辑
        const data = {
            message: 'PUT request handled',
            path: event.path,
            timestamp: new Date().toISOString()
        };

        return successResponse(data);
    } catch (error) {
        logger.error('PUT handler error:', error);
        return errorResponse('Failed to handle PUT request', 500);
    }
}

/**
 * 处理 DELETE 请求
 */
async function handleDelete(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        logger.info('Handling DELETE request', {path: event.path});

        // TODO: 实现 DELETE 逻辑
        const data = {
            message: 'DELETE request handled',
            path: event.path,
            timestamp: new Date().toISOString()
        };

        return successResponse(data);
    } catch (error) {
        logger.error('DELETE handler error:', error);
        return errorResponse('Failed to handle DELETE request', 500);
    }
}
