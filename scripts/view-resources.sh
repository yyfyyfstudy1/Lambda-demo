#!/bin/bash

# LocalStack 资源查看器脚本

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENDPOINT="http://localhost:4566"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 LocalStack 资源查看器${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查 LocalStack 是否运行
if ! curl -s $ENDPOINT/_localstack/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  LocalStack 未运行${NC}"
    echo "请先运行: npm run local:start"
    exit 1
fi

echo -e "${BLUE}🔗 LocalStack Endpoint:${NC} $ENDPOINT"
echo ""

# DynamoDB 表
echo -e "${BLUE}📋 DynamoDB 表:${NC}"
aws --endpoint-url=$ENDPOINT dynamodb list-tables --region us-east-1 | jq -r '.TableNames[]' | while read table; do
    count=$(aws --endpoint-url=$ENDPOINT dynamodb scan --table-name $table --select COUNT --region us-east-1 | jq -r '.Count')
    echo "  • $table (${count} 条记录)"
done
echo ""

# Lambda 函数
echo -e "${BLUE}⚡ Lambda 函数:${NC}"
functions=$(aws --endpoint-url=$ENDPOINT lambda list-functions --region us-east-1 2>/dev/null | jq -r '.Functions[]?.FunctionName' || echo "")
if [ -z "$functions" ]; then
    echo "  (暂无函数)"
else
    echo "$functions" | while read func; do
        echo "  • $func"
    done
fi
echo ""

# API Gateway
echo -e "${BLUE}🌐 API Gateway:${NC}"
apis=$(aws --endpoint-url=$ENDPOINT apigateway get-rest-apis --region us-east-1 2>/dev/null | jq -r '.items[]?.name' || echo "")
if [ -z "$apis" ]; then
    echo "  (暂无 API)"
else
    echo "$apis" | while read api; do
        echo "  • $api"
    done
fi
echo ""

# S3 存储桶
echo -e "${BLUE}🪣 S3 Buckets:${NC}"
buckets=$(aws --endpoint-url=$ENDPOINT s3 ls --region us-east-1 2>/dev/null | awk '{print $3}' || echo "")
if [ -z "$buckets" ]; then
    echo "  (暂无存储桶)"
else
    echo "$buckets" | while read bucket; do
        echo "  • $bucket"
    done
fi
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "💡 查看 DynamoDB 表内容:"
echo "   aws --endpoint-url=$ENDPOINT dynamodb scan --table-name lambda-spacetalk-local-families | jq ."
echo ""
echo "🌐 访问 Web Dashboard:"
echo "   https://app.localstack.cloud"
echo ""
echo "📊 健康检查:"
echo "   curl http://localhost:4566/_localstack/health | jq ."
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

