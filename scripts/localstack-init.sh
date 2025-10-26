#!/bin/bash

# LocalStack 初始化脚本
# 在 LocalStack 启动后自动执行，创建必要的 AWS 资源

echo "🚀 初始化 LocalStack AWS 资源..."

# 等待 LocalStack 完全启动
sleep 5

# 设置 AWS CLI 使用 LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

LOCALSTACK_ENDPOINT="http://localhost:4566"

# 创建 Cognito User Pool
echo "📝 创建 Cognito User Pool..."
aws --endpoint-url=$LOCALSTACK_ENDPOINT cognito-idp create-user-pool \
  --pool-name lambda-spacetalk-local-user-pool \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --username-attributes email \
  --auto-verified-attributes email \
  --region us-east-1 > /tmp/user-pool.json 2>&1

USER_POOL_ID=$(cat /tmp/user-pool.json | grep -o '"Id": "[^"]*"' | head -1 | sed 's/"Id": "\([^"]*\)"/\1/')

if [ -z "$USER_POOL_ID" ]; then
  echo "⚠️  User Pool 可能已存在或创建失败"
  USER_POOL_ID="us-east-1_localstack"
fi

echo "✅ User Pool ID: $USER_POOL_ID"

# 创建 Cognito User Pool Client
echo "📝 创建 Cognito User Pool Client..."
aws --endpoint-url=$LOCALSTACK_ENDPOINT cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name lambda-spacetalk-local-client \
  --explicit-auth-flows ALLOW_ADMIN_USER_PASSWORD_AUTH ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1 > /tmp/user-pool-client.json 2>&1

CLIENT_ID=$(cat /tmp/user-pool-client.json | grep -o '"ClientId": "[^"]*"' | head -1 | sed 's/"ClientId": "\([^"]*\)"/\1/')

if [ -z "$CLIENT_ID" ]; then
  echo "⚠️  Client 可能已存在或创建失败"
  CLIENT_ID="localstack-client"
fi

echo "✅ Client ID: $CLIENT_ID"

# 创建测试用户
echo "📝 创建测试用户..."
aws --endpoint-url=$LOCALSTACK_ENDPOINT cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true \
  --message-action SUPPRESS \
  --region us-east-1 2>&1 || echo "用户可能已存在"

# 设置用户密码
aws --endpoint-url=$LOCALSTACK_ENDPOINT cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username test@example.com \
  --password Test1234! \
  --permanent \
  --region us-east-1 2>&1 || echo "密码设置可能失败"

echo "✅ 测试用户创建完成: test@example.com / Test1234!"

# 创建 DynamoDB 表
echo "📝 创建 DynamoDB 表..."

# Users 表
aws --endpoint-url=$LOCALSTACK_ENDPOINT dynamodb create-table \
  --table-name lambda-spacetalk-local-users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1 2>&1 || echo "Users 表可能已存在"

echo "✅ Users 表创建完成"

# Families 表
aws --endpoint-url=$LOCALSTACK_ENDPOINT dynamodb create-table \
  --table-name lambda-spacetalk-local-families \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=userId-index,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1 2>&1 || echo "Families 表可能已存在"

echo "✅ Families 表创建完成"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 LocalStack 初始化完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 资源信息："
echo "  User Pool ID: $USER_POOL_ID"
echo "  Client ID: $CLIENT_ID"
echo "  测试用户: test@example.com / Test1234!"
echo "  DynamoDB 表: lambda-spacetalk-local-users, lambda-spacetalk-local-families"
echo ""
echo "🔗 LocalStack 端点: http://localhost:4566"
echo ""
echo "下一步："
echo "  cd terraform"
echo "  terraform init"
echo "  terraform apply -var-file=environments/local.tfvars"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

