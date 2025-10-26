# 本地测试 Lambda 函数指南

## 前提条件

### 1. 安装 AWS SAM CLI
```bash
# macOS (使用 Homebrew)
brew install aws-sam-cli

# 验证安装
sam --version
```

### 2. 安装 VS Code AWS Toolkit
1. 打开 VS Code
2. 进入扩展市场 (⇧⌘X)
3. 搜索 "AWS Toolkit"
4. 安装 "AWS Toolkit" 扩展

### 3. 配置 AWS 凭证
```bash
# 配置 AWS CLI
aws configure

# 或设置环境变量
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=ap-southeast-1
```

## 构建 Lambda 包

在测试前，需要先编译和打包代码：

```bash
# 完整构建
npm run build

# 这会执行：
# 1. 清理旧文件
# 2. TypeScript 编译
# 3. 打包 Lambda ZIP
```

## 方法 1: 使用 VS Code AWS Toolkit (推荐)

### 步骤 1: 打开调试面板
1. 点击 VS Code 左侧的 "Run and Debug" 图标 (⇧⌘D)
2. 从下拉菜单选择一个配置：
   - `Auth:Login (local)` - 测试登录
   - `Auth:Register (local)` - 测试注册
   - `Family:List (local)` - 测试获取家庭列表
   - `Family:Create (local)` - 测试创建家庭

### 步骤 2: 运行测试
1. 选择配置后点击绿色播放按钮 (F5)
2. 查看调试控制台输出
3. 可以设置断点进行调试

### 步骤 3: 修改测试数据
编辑 `.vscode/launch.json` 文件中的 `payload.json` 部分来自定义测试数据。

## 方法 2: 使用 SAM CLI 命令行

### 本地调用特定函数

```bash
# 测试 Auth Lambda - 登录
sam local invoke AuthFunction \
  --event events/auth-login.json \
  --template template.yaml

# 测试 Auth Lambda - 注册
sam local invoke AuthFunction \
  --event events/auth-register.json \
  --template template.yaml

# 测试 Family Lambda - 获取列表
sam local invoke FamilyFunction \
  --event events/family-list.json \
  --template template.yaml

# 测试 Family Lambda - 创建家庭
sam local invoke FamilyFunction \
  --event events/family-create.json \
  --template template.yaml
```

### 启动本地 API Gateway

```bash
# 启动本地 API 服务器（端口 3000）
sam local start-api --template template.yaml

# 然后可以使用 curl 测试：
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo1234!","username":"demouser"}'

curl http://localhost:3000/family
```

### 使用 Docker 调试

```bash
# SAM CLI 会自动使用 Docker 创建本地 Lambda 环境
# 确保 Docker Desktop 正在运行

# 查看日志
sam local invoke AuthFunction \
  --event events/auth-login.json \
  --log-file logs/local-test.log
```

## 方法 3: 使用 AWS Lambda Console (远程测试)

```bash
# 直接调用已部署的 Lambda
aws lambda invoke \
  --function-name lambda-spacetalk-dev-auth \
  --region ap-southeast-1 \
  --cli-binary-format raw-in-base64-out \
  --payload file://events/auth-login.json \
  response.json

# 查看响应
cat response.json | jq .
```

## 自定义测试事件

### 创建新的测试事件

在 `events/` 目录下创建新的 JSON 文件：

```json
{
  "httpMethod": "POST",
  "path": "/your/path",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token"
  },
  "queryStringParameters": {
    "param1": "value1"
  },
  "pathParameters": {
    "id": "123"
  },
  "body": "{\"key\":\"value\"}",
  "requestContext": {
    "requestId": "test-request-id",
    "authorizer": {
      "claims": {
        "sub": "user-id",
        "email": "user@example.com"
      }
    }
  }
}
```

## 环境变量配置

### 本地环境变量
创建 `.env.local` 文件（不要提交到 Git）：

```bash
STAGE=local
REGION=ap-southeast-1
DYNAMODB_TABLE_PREFIX=lambda-spacetalk-dev
COGNITO_USER_POOL_ID=ap-southeast-1_BXjpIpfBI
COGNITO_USER_POOL_CLIENT_ID=116nf4faiv8jd0eccbkbtci0dm
AWS_PROFILE=default
```

### 使用环境变量文件
```bash
sam local invoke AuthFunction \
  --event events/auth-login.json \
  --env-vars .env.local
```

## 调试技巧

### 1. 设置断点
在 VS Code 中直接点击行号左侧设置断点，然后 F5 运行。

### 2. 查看日志
```bash
# 实时查看 CloudWatch 日志
aws logs tail /aws/lambda/lambda-spacetalk-dev-auth \
  --region ap-southeast-1 \
  --follow
```

### 3. 使用 console.log 调试
在代码中添加 `console.log()` 或使用 logger：
```typescript
logger.info('Debug info', { data: someData });
```

### 4. 测试 DynamoDB 连接
```bash
# 列出表
aws dynamodb list-tables --region ap-southeast-1

# 扫描表内容
aws dynamodb scan \
  --table-name lambda-spacetalk-dev-users \
  --region ap-southeast-1
```

## 常见问题

### Q: Lambda 无法连接 DynamoDB
**A:** 确保 AWS 凭证配置正确，且有权限访问 DynamoDB 表。

### Q: 本地测试很慢
**A:** 首次运行时 SAM CLI 需要下载 Docker 镜像，之后会快很多。

### Q: 找不到 node_modules
**A:** 确保运行了 `npm run build`，它会将 node_modules 打包到 dist 目录。

### Q: 环境变量未生效
**A:** 检查 `template.yaml` 中的 `Environment.Variables` 配置。

## 测试脚本

创建快捷测试脚本 `test-local.sh`：

```bash
#!/bin/bash

echo "🧪 本地测试 Lambda 函数"
echo ""

# 构建项目
echo "📦 构建项目..."
npm run build

echo ""
echo "🔐 测试认证功能..."
echo "1. 测试登录"
sam local invoke AuthFunction --event events/auth-login.json

echo ""
echo "2. 测试注册"
sam local invoke AuthFunction --event events/auth-register.json

echo ""
echo "👨‍👩‍👧‍👦 测试家庭功能..."
echo "3. 测试获取家庭列表"
sam local invoke FamilyFunction --event events/family-list.json

echo ""
echo "4. 测试创建家庭"
sam local invoke FamilyFunction --event events/family-create.json

echo ""
echo "✅ 测试完成！"
```

```bash
# 添加执行权限
chmod +x test-local.sh

# 运行测试
./test-local.sh
```

## 性能测试

### 使用 Artillery 进行负载测试

```bash
# 安装 Artillery
npm install -g artillery

# 创建测试配置 artillery.yml
# 然后运行
artillery run artillery.yml
```

## 持续集成

在 CI/CD 管道中集成本地测试：

```yaml
# .github/workflows/test.yml
- name: Run SAM Local Tests
  run: |
    npm run build
    sam local invoke AuthFunction --event events/auth-login.json
```

## 下一步

1. ✅ 设置本地开发环境
2. ✅ 运行基础测试
3. 📝 编写单元测试 (`npm test`)
4. 📝 编写集成测试
5. 🚀 配置 CI/CD 自动测试

## 相关资源

- [AWS SAM CLI 文档](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [AWS Toolkit for VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
- [Lambda 本地测试](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html)

