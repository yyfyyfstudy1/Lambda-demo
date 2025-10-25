// Jest测试设置文件

// 设置测试环境变量
process.env['NODE_ENV'] = 'test';
process.env['AWS_REGION'] = 'us-east-1';
process.env['STAGE'] = 'test';
process.env['DYNAMODB_TABLE_PREFIX'] = 'lambda-spacetalk-test';
process.env['COGNITO_USER_POOL_ID'] = 'test-pool-id';
process.env['COGNITO_USER_POOL_CLIENT_ID'] = 'test-client-id';
process.env['JWT_SECRET'] = 'test-secret';
process.env['LOG_LEVEL'] = 'error';

// 全局测试超时
jest.setTimeout(10000);
