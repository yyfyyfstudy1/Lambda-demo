import { ApiResponse } from '../types';

export const createResponse = <T>(
  statusCode: number,
  data?: T,
  headers: Record<string, string> = {}
): ApiResponse<T> => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    ...headers
  };

  return {
    statusCode,
    headers: defaultHeaders,
    body: data ? JSON.stringify(data) : ''
  };
};

export const successResponse = <T>(data: T, statusCode = 200): ApiResponse<T> => {
  return createResponse(statusCode, data);
};

export const errorResponse = (
  message: string,
  statusCode = 500,
  code?: string
): ApiResponse => {
  return createResponse(statusCode, {
    error: 'Error',
    message,
    code
  });
};

export const validationErrorResponse = (message: string): ApiResponse => {
  return createResponse(400, {
    error: 'Validation Error',
    message,
    code: 'VALIDATION_ERROR'
  });
};

export const unauthorizedResponse = (message = 'Unauthorized'): ApiResponse => {
  return createResponse(401, {
    error: 'Unauthorized',
    message,
    code: 'UNAUTHORIZED'
  });
};

export const notFoundResponse = (message = 'Resource not found'): ApiResponse => {
  return createResponse(404, {
    error: 'Not Found',
    message,
    code: 'NOT_FOUND'
  });
};
