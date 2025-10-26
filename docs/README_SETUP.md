# 快速启动指南

## 🚀 本地运行步骤

### 1. 安装依赖（已完成）
```bash
npm install
```

### 2. 构建项目（已完成）
```bash
npm run build
```

### 3. 初始化Terraform并部署基础设施

```bash
# 进入terraform目录
cd terraform

# 初始化Terraform
terraform init

# 查看部署计划
terraform plan

# 部署基础设施（创建Cognito、DynamoDB、API Gateway等）
terraform apply

# 记录输出的值，特别是：
# - cognito_user_pool_id
# - cognito_user_pool_client_id
# - api_gateway_rest_api_url

cd ..
```

### 4. 配置环境变量

将terraform输出的值填入环境变量。创建 `.env` 文件：

```bash
# 复制示例文件
cp env.example .env

# 编辑 .env 文件，填入Terraform输出的值
# COGNITO_USER_POOL_ID=你的值
# COGNITO_USER_POOL_CLIENT_ID=你的值
```

### 5. 本地开发（无需AWS）

如果只想本地测试代码而不连接AWS：

```bash
# 运行本地Serverless离线模式
npm run local
```

这将在 `http://localhost:3000` 启动本地API服务器。

### 6. 部署到AWS

```bash
# 部署Lambda函数到AWS
npm run deploy
```

## 📝 API端点

部署后，您可以使用以下端点：

### 认证相关
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /auth/me` - 获取当前用户信息（需要认证）

### 家庭管理（需要认证）
- `POST /family` - 创建家庭
- `GET /family` - 获取家庭列表
- `GET /family/{id}` - 获取家庭详情
- `PUT /family/{id}` - 更新家庭
- `DELETE /family/{id}` - 删除家庭
- `POST /family/{id}/members` - 添加家庭成员
- `DELETE /family/{id}/members/{memberId}` - 删除家庭成员

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

## 📦 项目状态

✅ 项目结构已创建  
✅ 依赖已安装  
✅ TypeScript编译成功  
⏳ 等待部署Terraform基础设施  
⏳ 等待配置环境变量  
⏳ 等待部署Lambda函数  

## 🔧 常见问题

### 问题1：Terraform部署失败
- 确保已配置AWS CLI凭证：`aws configure`
- 检查AWS账户权限

### 问题2：本地测试失败
- 检查环境变量是否正确配置
- 确保DynamoDB表已创建

### 问题3：Lambda部署失败
- 先运行 `npm run build` 确保编译成功
- 检查Serverless配置

## 📚 下一步

1. 部署Terraform基础设施
2. 配置环境变量
3. 部署Lambda函数
4. 测试API端点
5. 创建第一个用户和家庭

祝您使用愉快！🎉

