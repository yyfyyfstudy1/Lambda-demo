export interface ApiResponse<T = any> {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface ApiRequest {
  httpMethod: string;
  path: string;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  headers: Record<string, string>;
  body?: string;
  requestContext: {
    authorizer?: {
      claims?: {
        sub: string;
        email: string;
        'cognito:username': string;
      };
    };
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  userId: string;
  name: string;
  description?: string;
  members: FamilyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  email?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface CreateFamilyRequest {
  name: string;
  description?: string;
  members: Omit<FamilyMember, 'id'>[];
}

export interface UpdateFamilyRequest {
  name?: string;
  description?: string;
  members?: Omit<FamilyMember, 'id'>[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
}
