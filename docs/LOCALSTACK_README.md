# 🏠 LocalStack 本地开发环境

## 概述

本项目现已支持使用 LocalStack 进行完全本地化的开发和测试，无需连接真实的 AWS 服务！

## 🎯 架构对比

### 传统方式（之前）
```
本地 Lambda (Docker) → 互联网 → AWS Cognito/DynamoDB (线上)
```
❌ 需要网络  
❌ 产生费用  
❌ 污染线上数据

### LocalStack 方式（现在）
```
本地 Lambda (Docker) → LocalStack (Docker) → 模拟的 AWS 服务
```
✅ 完全离线  
✅ 零费用  
✅ 数据隔离

## 🚀 快速开始

### 一键启动
```bash
npm run local:start
```

这会自动：
1. ✅ 启动 LocalStack Docker 容器
2. ✅ 创建 Cognito User Pool（免费版有限制）
3. ✅ 创建 DynamoDB 表
4. ✅ 创建测试用户
5. ✅ 编译 TypeScript 代码

### 测试 Lambda 函数

#### 方法 1: WebStorm（推荐）
1. 选择运行配置（如 "Auth:Login (Local)"）
2. 点击 Debug 按钮（🐛）
3. 自动连接到 LocalStack

#### 方法 2: 命令行
```bash
# 测试登录
sam local invoke AuthFunction \
  --event events/auth-login-local.json \
  --template template-local.yaml

# 测试 DynamoDB
sam local invoke FamilyFunction \
  --event events/family-list.json \
  --template template-local.yaml
```

#### 方法 3: 启动本地 API
```bash
sam local start-api --template template-local.yaml

# 测试
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

## 📁 环境配置文件

### 本地环境（LocalStack）
- **配置文件**: `terraform/environments/local.tfvars`
- **环境变量**: `env.local`
- **SAM 模板**: `template-local.yaml`

```bash
# 使用 Terraform 配置 LocalStack
npm run local:terraform
```

### 开发环境（AWS）
- **配置文件**: `terraform/environments/dev.tfvars`
- **部署命令**: `npm run deploy`

### 生产环境（AWS）
- **配置文件**: `terraform/environments/prod.tfvars`
- **部署命令**: `npm run deploy:prod`

## 🔧 可用命令

```bash
# 本地开发
npm run local:start       # 启动 LocalStack 环境
npm run local:stop        # 停止 LocalStack
npm run local:logs        # 查看 LocalStack 日志
npm run local:terraform   # 使用 Terraform 配置 LocalStack

# 构建
npm run build             # 编译 + 打包

# 测试
npm test                  # 单元测试
sam local start-api       # 启动本地 API

# 部署到 AWS
npm run deploy            # 部署到 dev 环境
npm run deploy:prod       # 部署到 prod 环境
```

## ⚠️ LocalStack 限制

### 免费版（Community）
- ✅ DynamoDB - 完全支持
- ✅ Lambda - 完全支持
- ✅ API Gateway - 完全支持
- ✅ S3, IAM, STS - 完全支持
- ⚠️ Cognito - **需要 Pro 版本**

### 解决方案

#### 选项 1: 使用 LocalStack Pro（推荐）
```bash
# 设置 Pro 许可证
export LOCALSTACK_API_KEY=your-api-key

# 启动
docker-compose up -d
```

#### 选项 2: Mock Cognito（开发测试）
我已经在代码中添加了环境检测，你可以扩展为：
```typescript
if (CONFIG.USE_LOCALSTACK && CONFIG.STAGE === 'local') {
  // 使用简化的本地认证（跳过 Cognito）
  return mockAuthenticate(email, password);
}
```

#### 选项 3: 混合模式（推荐用于免费版）
```bash
# 本地环境配置
USE_LOCALSTACK=partial  # 只用 DynamoDB
COGNITO_USER_POOL_ID=<dev环境的ID>  # Cognito用dev环境
```

## 🧪 测试验证

### 1. 测试 DynamoDB（已验证 ✅）
```bash
# 查看表
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# 插入数据
aws --endpoint-url=http://localhost:4566 dynamodb put-item \
  --table-name lambda-spacetalk-local-users \
  --item '{"id":{"S":"test-123"},"email":{"S":"test@test.com"}}'

# 查询数据
aws --endpoint-url=http://localhost:4566 dynamodb scan \
  --table-name lambda-spacetalk-local-users
```

### 2. 测试 Lambda
```bash
sam local invoke AuthFunction \
  --event events/family-list.json \
  --template template-local.yaml
```

### 3. 测试完整流程
```bash
# 启动本地 API
sam local start-api --template template-local.yaml

# 测试创建家庭（使用 DynamoDB）
curl -X POST http://localhost:3000/family \
  -H "Content-Type: application/json" \
  -d '{"name":"测试家庭","description":"这是本地测试"}'
```

## 📊 资源管理

### 查看 LocalStack 资源
```bash
# DynamoDB 表
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# Cognito (Pro 版本)
aws --endpoint-url=http://localhost:4566 cognito-idp list-user-pools --max-results 10

# Lambda 函数
aws --endpoint-url=http://localhost:4566 lambda list-functions
```

### 清理和重置
```bash
# 停止 LocalStack
docker-compose down

# 删除持久化数据
rm -rf localstack/

# 重新启动
npm run local:start
```

## 🔄 开发工作流

```
1. 修改代码
   ↓
2. npm run build
   ↓
3. sam build --template template-local.yaml
   ↓
4. 在 WebStorm 中调试
   或
   sam local invoke AuthFunction --event events/xxx.json
   ↓
5. 验证通过后部署到 dev 环境
   npm run deploy
```

## 💡 最佳实践

### 环境隔离
- **local**: LocalStack（完全本地，免费）
- **dev**: AWS 开发环境（团队共享）
- **staging**: AWS 预生产环境（接近生产）
- **prod**: AWS 生产环境（只通过 CI/CD 部署）

### 数据管理
- Local: 随意测试，数据可清除
- Dev: 测试数据，定期清理
- Staging: 模拟生产数据
- Prod: 真实用户数据，严格保护

## 🐛 故障排除

### LocalStack 未启动
```bash
docker-compose up -d localstack
docker-compose logs -f localstack
```

### Cognito 错误（Pro 功能）
使用混合模式或升级到 LocalStack Pro

### 端口冲突
```bash
# 修改 docker-compose.yml 中的端口
ports:
  - "14566:4566"  # 使用不同的端口
```

## 📚 相关资源

- [LocalStack 文档](https://docs.localstack.cloud/)
- [LocalStack Pro 功能对比](https://localstack.cloud/pricing)
- 项目详细文档: `docs/` 目录

---

现在你可以完全离线开发了！🎉

