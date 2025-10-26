import { DynamoDB } from 'aws-sdk';
import { CONFIG, DYNAMODB_TABLES } from '../config';
import logger from '../utils/logger';

export class DynamoDBService {
  private dynamodb: DynamoDB.DocumentClient;

  constructor() {
    const dynamoConfig: any = {
      region: CONFIG.AWS_REGION
    };

    // 如果使用 LocalStack，设置自定义端点
    if (CONFIG.USE_LOCALSTACK) {
      dynamoConfig.endpoint = CONFIG.LOCALSTACK_ENDPOINT;
      dynamoConfig.credentials = {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      };
      logger.info('Using LocalStack for DynamoDB', { endpoint: CONFIG.LOCALSTACK_ENDPOINT });
    }

    this.dynamodb = new DynamoDB.DocumentClient(dynamoConfig);
  }

  async getItem(tableName: string, key: Record<string, any>): Promise<any> {
    try {
      const params = {
        TableName: tableName,
        Key: key
      };
      
      const result = await this.dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      logger.error('DynamoDB getItem error:', error);
      throw error;
    }
  }

  async putItem(tableName: string, item: Record<string, any>): Promise<void> {
    try {
      const params = {
        TableName: tableName,
        Item: item
      };
      
      await this.dynamodb.put(params).promise();
    } catch (error) {
      logger.error('DynamoDB putItem error:', error);
      throw error;
    }
  }

  async updateItem(
    tableName: string,
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>
  ): Promise<void> {
    try {
      const params: DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW'
      };

      if (expressionAttributeNames) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }
      
      await this.dynamodb.update(params).promise();
    } catch (error) {
      logger.error('DynamoDB updateItem error:', error);
      throw error;
    }
  }

  async deleteItem(tableName: string, key: Record<string, any>): Promise<void> {
    try {
      const params = {
        TableName: tableName,
        Key: key
      };
      
      await this.dynamodb.delete(params).promise();
    } catch (error) {
      logger.error('DynamoDB deleteItem error:', error);
      throw error;
    }
  }

  async query(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, any>,
    indexName?: string
  ): Promise<any[]> {
    try {
      const params: DynamoDB.DocumentClient.QueryInput = {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues
      };

      if (indexName) {
        params.IndexName = indexName;
      }
      
      const result = await this.dynamodb.query(params).promise();
      return result.Items || [];
    } catch (error) {
      logger.error('DynamoDB query error:', error);
      throw error;
    }
  }

  async scan(
    tableName: string,
    filterExpression?: string,
    expressionAttributeValues?: Record<string, any>
  ): Promise<any[]> {
    try {
      const params: DynamoDB.DocumentClient.ScanInput = {
        TableName: tableName
      };

      if (filterExpression && expressionAttributeValues) {
        params.FilterExpression = filterExpression;
        params.ExpressionAttributeValues = expressionAttributeValues;
      }
      
      const result = await this.dynamodb.scan(params).promise();
      return result.Items || [];
    } catch (error) {
      logger.error('DynamoDB scan error:', error);
      throw error;
    }
  }
}

export const dynamoDBService = new DynamoDBService();
export { DYNAMODB_TABLES };
