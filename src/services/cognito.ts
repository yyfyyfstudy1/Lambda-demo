import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { CONFIG } from '../config';
import logger from '../utils/logger';

export class CognitoService {
  private cognito: CognitoIdentityServiceProvider;

  constructor() {
    this.cognito = new CognitoIdentityServiceProvider({
      region: CONFIG.AWS_REGION
    });
  }

  async authenticateUser(email: string, password: string): Promise<any> {
    try {
      const params = {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        UserPoolId: CONFIG.COGNITO_USER_POOL_ID,
        ClientId: CONFIG.COGNITO_USER_POOL_CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      };

      const result = await this.cognito.adminInitiateAuth(params).promise();
      return result.AuthenticationResult;
    } catch (error) {
      logger.error('Cognito authentication error:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const params = {
        UserPoolId: CONFIG.COGNITO_USER_POOL_ID,
        Username: email
      };

      const result = await this.cognito.adminGetUser(params).promise();
      return result;
    } catch (error) {
      logger.error('Cognito getUserByEmail error:', error);
      throw error;
    }
  }

  async createUser(email: string, password: string, _username: string): Promise<any> {
    try {
      const params = {
        UserPoolId: CONFIG.COGNITO_USER_POOL_ID,
        Username: email,
        UserAttributes: [
          {
            Name: 'email',
            Value: email
          },
          {
            Name: 'email_verified',
            Value: 'true'
          }
        ],
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS'
      };

      const result = await this.cognito.adminCreateUser(params).promise();
      return result.User;
    } catch (error) {
      logger.error('Cognito createUser error:', error);
      throw error;
    }
  }

  async setUserPassword(_username: string, password: string): Promise<void> {
    try {
      const params = {
        UserPoolId: CONFIG.COGNITO_USER_POOL_ID,
        Username: _username,
        Password: password,
        Permanent: true
      };

      await this.cognito.adminSetUserPassword(params).promise();
    } catch (error) {
      logger.error('Cognito setUserPassword error:', error);
      throw error;
    }
  }
}

export const cognitoService = new CognitoService();
