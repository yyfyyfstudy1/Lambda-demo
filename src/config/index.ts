import { config } from 'dotenv';

config();

export const CONFIG = {
  AWS_REGION: process.env['AWS_REGION'] || 'us-east-1',
  STAGE: process.env['STAGE'] || 'dev',
  DYNAMODB_TABLE_PREFIX: process.env['DYNAMODB_TABLE_PREFIX'] || 'lambda-spacetalk-dev',
  COGNITO_USER_POOL_ID: process.env['COGNITO_USER_POOL_ID'] || '',
  COGNITO_USER_POOL_CLIENT_ID: process.env['COGNITO_USER_POOL_CLIENT_ID'] || '',
  JWT_SECRET: process.env['JWT_SECRET'] || 'your-secret-key',
  LOG_LEVEL: process.env['LOG_LEVEL'] || 'info',
} as const;

export const DYNAMODB_TABLES = {
  USERS: `${CONFIG.DYNAMODB_TABLE_PREFIX}-users`,
  FAMILIES: `${CONFIG.DYNAMODB_TABLE_PREFIX}-families`,
} as const;
