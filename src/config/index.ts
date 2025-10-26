import {config} from 'dotenv';

config();

// 检测是否使用 LocalStack
const isLocalStack = process.env['USE_LOCALSTACK'] === 'true' || process.env['STAGE'] === 'local';
const localStackEndpoint = process.env['LOCALSTACK_ENDPOINT'] || 'http://localhost:4566';

export const CONFIG = {
    AWS_REGION: process.env['REGION'] || process.env['AWS_REGION'] || (isLocalStack ? 'us-east-1' : 'ap-southeast-1'),
    STAGE: process.env['STAGE'] || 'dev',
    DYNAMODB_TABLE_PREFIX: process.env['DYNAMODB_TABLE_PREFIX'] || 'lambda-spacetalk-dev',
    COGNITO_USER_POOL_ID: process.env['COGNITO_USER_POOL_ID'] || '',
    COGNITO_USER_POOL_CLIENT_ID: process.env['COGNITO_USER_POOL_CLIENT_ID'] || '',
    JWT_SECRET: process.env['JWT_SECRET'] || 'your-secret-key',
    LOG_LEVEL: process.env['LOG_LEVEL'] || 'info',

    // LocalStack 配置
    USE_LOCALSTACK: isLocalStack,
    LOCALSTACK_ENDPOINT: localStackEndpoint,
} as const;

export const DYNAMODB_TABLES = {
    USERS: `${CONFIG.DYNAMODB_TABLE_PREFIX}-users`,
    FAMILIES: `${CONFIG.DYNAMODB_TABLE_PREFIX}-families`,
    Route: `${CONFIG.DYNAMODB_TABLE_PREFIX}-route`
} as const;
