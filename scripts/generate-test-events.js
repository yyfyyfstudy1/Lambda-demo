#!/usr/bin/env node

// 生成测试事件的辅助脚本
const fs = require('fs');
const path = require('path');

// 测试数据
const testData = {
  familyCreate: {
    name: "testFamily",
    description: "这是你妈的家庭",
    members: [
      {
        name: "张三",
        relationship: "父亲",
        age: 45,
        email: "zhangsan@example.com"
      },
      {
        name: "李四",
        relationship: "母亲",
        age: 42,
        email: "lisi@example.com"
      }
    ]
  }
};

// API Gateway 事件模板
const createEvent = (bodyData) => ({
  httpMethod: "POST",
  path: "/family",
  headers: {
    "Content-Type": "application/json"
  },
  queryStringParameters: null,
  pathParameters: null,
  body: JSON.stringify(bodyData), // 自动转换为字符串
  requestContext: {
    requestId: "test-request-id",
    authorizer: {
      claims: {
        sub: "test-user-id-12345",
        email: "test@example.com"
      }
    }
  }
});

// 生成文件
const eventsDir = path.join(__dirname, '..', 'events');
const event = createEvent(testData.familyCreate);

fs.writeFileSync(
  path.join(eventsDir, 'family-create.json'),
  JSON.stringify(event, null, 2)
);

console.log('✅ 测试事件文件已生成: events/family-create.json');
