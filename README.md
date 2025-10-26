# Lambda Demo

企业级 Node.js Lambda 后端项目，使用 Cognito 身份验证、DynamoDB 数据库和 Terraform 基础设施管理。

**✨ 支持完全本地化开发（LocalStack）+ 多环境部署（AWS）**

## 🚀 快速开始

### 本地开发（使用 LocalStack）

```bash
# 一键启动本地环境
npm run local:start

# 在 WebStorm/VS Code 中调试（F5）
# 或使用命令行
sam local invoke AuthFunction --event events/auth-login-local.json
```

**优势**:
- ✅ 完全离线开发
- ✅ 零 AWS 成本
- ✅ 不污染线上数据
- ✅ 快速迭代

### 部署到 AWS

```bash
# 部署到开发环境
npm run deploy

# 部署到生产环境
npm run deploy:prod
```

## 📁 项目结构

```
lambda-spacetalk/
├── src/                      # TypeScript 源代码
│   ├── handlers/            # Lambda 处理器
│   ├── services/            # 业务服务（支持LocalStack）
│   └── config/              # 多环境配置
├── terraform/                # 基础设施即代码
│   └── environments/        # 环境配置文件
│       ├── local.tfvars     # LocalStack
│       ├── dev.tfvars       # AWS Dev
│       └── prod.tfvars      # AWS Prod
├── events/                   # 测试事件
├── docker-compose.yml        # LocalStack 配置
├── template-local.yaml       # SAM 本地模板
└── scripts/                  # 自动化脚本
```

## 🔧 核心命令

### 本地开发（LocalStack）

```bash
npm run local:start        # 启动 LocalStack 环境
npm run local:stop         # 停止 LocalStack
npm run local:logs         # 查看日志
npm run local:terraform    # Terraform 配置 LocalStack
```

### 构建和测试

```bash
npm run build              # 编译 TypeScript + 打包
npm test                   # 运行单元测试
sam local start-api        # 启动本地 API (http://localhost:3000)
```

### 部署到 AWS

```bash
npm run deploy             # 部署到 dev 环境
npm run deploy:prod        # 部署到 prod 环境
npm run terraform:plan     # 查看变更计划
```

## 🌍 多环境配置

| 环境 | 用途 | 配置文件 | AWS 服务 |
|------|------|---------|---------|
| **local** | 本地开发 | `local.tfvars` | LocalStack (免费) |
| **dev** | 开发测试 | `dev.tfvars` | AWS ap-southeast-1 |
| **prod** | 生产环境 | `prod.tfvars` | AWS ap-southeast-1 |

## 📖 API 端点

### 认证端点（无需授权）
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册

### 家庭管理（需要 Cognito 授权）
- `GET /family` - 获取家庭列表
- `POST /family` - 创建家庭
- `GET /family/{id}` - 获取详情
- `PUT /family/{id}` - 更新家庭
- `DELETE /family/{id}` - 删除家庭
- `POST /family/{id}/members` - 添加成员
- `DELETE /family/{id}/members/{memberId}` - 删除成员

## 🛠️ 技术栈

- **运行时**: Node.js 18.x
- **语言**: TypeScript
- **框架**: AWS Lambda + SAM
- **数据库**: DynamoDB
- **身份验证**: AWS Cognito
- **基础设施**: Terraform
- **本地开发**: LocalStack + Docker

## 🔍 本地调试

### 环境要求
- Docker Desktop（运行中）
- Node.js 18+
- AWS SAM CLI
- Terraform

### IDE 配置
- **WebStorm**: 4 个预配置的调试配置
- **VS Code**: `.vscode/launch.json` 配置

### 开发工作流
```
1. npm run local:start      # 启动 LocalStack
2. 修改代码                  # 开发
3. npm run build            # 编译
4. F5 调试或 sam local invoke
5. npm run local:stop       # 停止环境
```

## ⚠️ LocalStack 限制

### 免费版
- ✅ **DynamoDB** - 完全支持
- ✅ **Lambda** - 完全支持
- ✅ **API Gateway** - 完全支持
- ⚠️ **Cognito** - 需要 Pro 版本

### 解决方案
1. **LocalStack Pro** - 完整功能（推荐商业项目）
2. **混合模式** - DynamoDB 用 LocalStack，Cognito 用 AWS dev
3. **Mock 认证** - 开发时跳过真实认证

详见 `docs/LOCALSTACK_SETUP.md`

## 📚 详细文档

- [LocalStack 配置完成](docs/LOCALSTACK_SETUP.md) - LocalStack 使用指南
- [本地测试](docs/LOCAL_TESTING.md) - 详细测试文档
- [WebStorm 配置](docs/WEBSTORM_GUIDE.md) - IDE 配置
- [部署总结](docs/DEPLOYMENT_SUMMARY.md) - 部署信息

## 🎯 最佳实践

### 环境隔离
- **local**: 快速开发，完全离线
- **dev**: 集成测试，团队共享
- **staging**: 预发布验证（可选）
- **prod**: 生产环境，严格控制

### 成本优化
- 开发：LocalStack（免费）
- 测试：dev 环境（低成本）
- 生产：按需计费，设置预算告警

### 安全性
- 开发者：只能访问 local 和 dev
- CI/CD：才能访问 staging 和 prod
- 生产数据：严格权限控制

## 📊 资源信息

### LocalStack（本地）
- **端点**: http://localhost:4566
- **User Pool**: us-east-1_localstack
- **测试用户**: test@example.com / Test1234!

### AWS Dev 环境
- **Region**: ap-southeast-1
- **User Pool**: ap-southeast-1_BXjpIpfBI
- **API**: https://tr3khtk0v4.execute-api.ap-southeast-1.amazonaws.com/dev

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 在 local 环境测试
4. 提交 PR

## 📄 许可证

MIT License

---

**现在你拥有企业级的本地开发环境！** 🎉
