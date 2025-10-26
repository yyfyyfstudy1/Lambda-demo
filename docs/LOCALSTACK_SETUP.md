# 🎉 LocalStack 本地开发环境 - 配置完成！

## ✅ 配置成功验证

### 核心功能测试结果

| 组件 | 状态 | 说明 |
|------|------|------|
| LocalStack 容器 | ✅ 运行中 | Docker容器正常 |
| DynamoDB 表 | ✅ 已创建 | users + families 表 |
| Lambda 函数 | ✅ 正常加载 | 所有模块正确导入 |
| LocalStack 连接 | ✅ 成功 | Lambda连接到LocalStack |
| Cognito | ⚠️ Pro版本 | 需要付费版或使用混合模式 |

### 验证日志
```
✅ "Using LocalStack for DynamoDB"
✅ "Using LocalStack for Cognito"
✅ Lambda 成功执行
✅ 无模块导入错误
```

## 🚀 快速使用指南

### 一键启动本地环境

```bash
npm run local:start
```

### 使用 WebStorm 调试

1. 选择运行配置（如 "Auth:Login (Local)"）
2. 点击 Debug 按钮（🐛）
3. 设置断点调试

### 使用命令行测试

```bash
# 测试 Lambda 函数
sam local invoke FamilyFunction \
  --event events/family-list.json

# 启动本地 API
sam local start-api --template template-local.yaml

# 访问 API
curl http://localhost:3000/family
```

## 📋 环境配置

### local (LocalStack)
```bash
# 配置文件
terraform/environments/local.tfvars
env.local
template-local.yaml

# 使用方式
npm run local:start
npm run local:terraform
```

### dev (AWS 开发环境)
```bash
# 配置文件  
terraform/environments/dev.tfvars

# 使用方式
npm run terraform:apply
npm run deploy
```

### prod (AWS 生产环境)
```bash
# 配置文件
terraform/environments/prod.tfvars

# 使用方式
npm run deploy:prod
```

## 🔧 可用命令

```bash
# LocalStack 管理
npm run local:start        # 启动 LocalStack 环境
npm run local:stop         # 停止 LocalStack
npm run local:logs         # 查看 LocalStack 日志
npm run local:terraform    # 使用 Terraform 配置 LocalStack

# 开发
npm run build              # 编译 + 打包
npm test                   # 运行测试

# 部署
npm run deploy             # 部署到 dev 环境
npm run deploy:prod        # 部署到 prod 环境
```

## ⚠️ LocalStack 免费版限制

### Cognito 需要 Pro 版本

**当前状态**: 免费版不支持 Cognito-IDP

**解决方案**:

#### 选项 1: LocalStack Pro（推荐给商业项目）
```bash
# 获取 API Key: https://app.localstack.cloud
export LOCALSTACK_API_KEY=your-key

# 重启 LocalStack
docker-compose down
docker-compose up -d
```

#### 选项 2: 混合模式（推荐免费使用）

修改 `env.local`:
```bash
# DynamoDB 使用 LocalStack（免费）
USE_LOCALSTACK=partial
DYNAMODB_ENDPOINT=http://localhost:4566

# Cognito 使用真实 AWS dev 环境
COGNITO_USER_POOL_ID=ap-southeast-1_BXjpIpfBI
COGNITO_USER_POOL_CLIENT_ID=116nf4faiv8jd0eccbkbtci0dm
# 不设置 COGNITO_ENDPOINT，会使用真实 AWS
```

#### 选项 3: Mock 认证（纯开发测试）

在 `src/services/cognito.ts` 添加:
```typescript
async authenticateUser(email: string, password: string): Promise<any> {
  // 本地开发时使用 mock 认证
  if (CONFIG.STAGE === 'local' && email === 'test@example.com' && password === 'Test1234!') {
    return {
      AccessToken: 'mock-access-token-for-local-dev',
      RefreshToken: 'mock-refresh-token',
      ExpiresIn: 3600
    };
  }
  
  // 真实环境调用 Cognito
  const params = { ... };
  return await this.cognito.adminInitiateAuth(params).promise();
}
```

## 🧪 测试示例

### DynamoDB 操作（完全可用 ✅）

```bash
# 查看表
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# 插入数据
aws --endpoint-url=http://localhost:4566 dynamodb put-item \
  --table-name lambda-spacetalk-local-families \
  --item file://test-family-item.json

# 查询数据  
aws --endpoint-url=http://localhost:4566 dynamodb scan \
  --table-name lambda-spacetalk-local-families
```

### Lambda 调用

```bash
# 使用 LocalStack（不涉及 Cognito）
sam local invoke FamilyFunction \
  --event events/family-create.json \
  --template template-local.yaml
```

## 📊 架构对比

### 之前（连接真实 AWS）
```
本地 Lambda → AWS Cognito (线上) → 💰
          → AWS DynamoDB (线上) → 💰
```

### 现在（LocalStack）
```
本地 Lambda → LocalStack DynamoDB → ✅ 免费
          → LocalStack Cognito → ⚠️ 需要Pro
          → 或 AWS dev Cognito → 💰 低成本
```

## 🎯 推荐的开发工作流

### 日常开发（使用 LocalStack）

```bash
# 1. 启动环境
npm run local:start

# 2. 开发
# 修改代码...

# 3. 测试
npm run build
# 在 WebStorm 中 Debug (F5)

# 4. 结束
npm run local:stop
```

### 部署到 AWS

```bash
# 测试通过后部署到 dev
npm run deploy

# 验证通过后部署到 prod
npm run deploy:prod
```

## 💡 最佳实践

### 环境隔离
1. **local**: LocalStack + Mock - 快速开发
2. **dev**: AWS 真实环境 - 集成测试
3. **staging**: AWS 真实环境 - 预发布验证
4. **prod**: AWS 真实环境 - 生产环境

### 数据管理
- local: 可随意测试，数据不持久
- dev: 测试数据，定期清理
- prod: 真实数据，严格保护

### 成本控制
- 开发时用 LocalStack（免费）
- 集成测试用 dev 环境（低成本）
- 生产环境严格控制访问

## 🐛 故障排除

### LocalStack 未启动
```bash
docker-compose up -d localstack
docker-compose logs -f localstack
```

### Cognito 错误（Pro 功能）
使用混合模式或 Mock 认证

### Lambda 找不到模块
```bash
npm run build
sam build --template template-local.yaml
```

### DynamoDB 查询错误
检查 GSI 配置和查询条件

## 📚 相关文档

- `LOCALSTACK_README.md` - 详细使用指南
- `README.md` - 项目主文档
- [LocalStack 官方文档](https://docs.localstack.cloud/)

---

**恭喜！你现在拥有企业级的本地开发环境了！** 🎊

