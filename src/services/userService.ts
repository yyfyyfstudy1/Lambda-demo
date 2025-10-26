import { v4 as uuidv4 } from 'uuid';
import { dynamoDBService, DYNAMODB_TABLES } from './dynamodb';
import { cognitoService } from './cognito';
import { User, LoginRequest, LoginResponse } from '../types';
import logger from '../utils/logger';

export class UserService {
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const { email, password } = loginData;
      
      // 使用Cognito进行身份验证
      const authResult = await cognitoService.authenticateUser(email, password);
      
      if (!authResult) {
        throw new Error('Authentication failed');
      }

      return {
        accessToken: authResult.AccessToken || '',
        refreshToken: authResult.RefreshToken || '',
        expiresIn: authResult.ExpiresIn || 3600,
        tokenType: 'Bearer'
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await dynamoDBService.getItem(DYNAMODB_TABLES.USERS, { id: userId });
      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await dynamoDBService.query(
        DYNAMODB_TABLES.USERS,
        'email = :email',
        { ':email': email },
        'email-index'  // 使用 GSI 索引
      );
      return users[0] || null;
    } catch (error) {
      logger.error('Get user by email error:', error);
      throw error;
    }
  }

  async createUser(email: string, username: string): Promise<User> {
    try {
      const userId = uuidv4();
      const now = new Date().toISOString();
      
      const user: User = {
        id: userId,
        email,
        username,
        createdAt: now,
        updatedAt: now
      };

      await dynamoDBService.putItem(DYNAMODB_TABLES.USERS, user);
      return user;
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      let updateExpression = 'SET updatedAt = :updatedAt';
      const expressionAttributeValues: Record<string, any> = {
        ':updatedAt': new Date().toISOString()
      };

      // 动态构建更新表达式
      const updateFields = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt');
      
      updateFields.forEach(field => {
        const value = updates[field as keyof User];
        if (value !== undefined) {
          updateExpression += `, ${field} = :${field}`;
          expressionAttributeValues[`:${field}`] = value;
        }
      });

      await dynamoDBService.updateItem(
        DYNAMODB_TABLES.USERS,
        { id: userId },
        updateExpression,
        expressionAttributeValues
      );

      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      return updatedUser;
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await dynamoDBService.deleteItem(DYNAMODB_TABLES.USERS, { id: userId });
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
