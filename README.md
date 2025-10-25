# Lambda SpaceTalk

企业级Node.js Lambda后端项目，使用Cognito身份验证、DynamoDB数据库和Terraform基础设施管理。

## 项目结构

```
lambda-spacetalk/
├── src/                          # 源代码
│   ├── handlers/                 # Lambda处理器
│   │   ├── auth.ts              # 身份验证处理器
│   │   └── family.ts            # 家庭管理处理器
│   ├── services/                 # 业务逻辑服务
│   │   ├── dynamodb.ts          # DynamoDB服务
│   │   ├── cognito.ts           # Cognito服务
│   │   ├── userService.ts        # 用户服务
│   │   └── familyService.ts     # 家庭服务
│   ├── utils/                    # 工具函数
│   │   ├── logger.ts            # 日志工具
│   │   ├── response.ts          # 响应工具
│   │   └── validation.ts        # 验证工具
│   ├── types/                    # 类型定义
│   │   └── index.ts             # 主要类型
│   └── config/                   # 配置
│       └── index.ts             # 配置管理
├── terraform/                    # 基础设施代码
│   ├── main.tf                  # 主要资源
│   ├── outputs.tf              # 输出定义
│   └── terraform.tfvars        # 环境配置
├── tests/                       # 测试文件
│   ├── unit/                   # 单元测试
│   ├── integration/            # 集成测试
│   └── setup.ts               # 测试设置
├── scripts/                    # 脚本
│   └── deploy.sh              # 部署脚本
├── serverless.yml              # Serverless配置
├── package.json               # 项目依赖
├── tsconfig.json              # TypeScript配置
├── jest.config.js             # Jest测试配置
├── .eslintrc.js               # ESLint配置
├── .prettierrc                # Prettier配置
└── README.md                  # 项目说明
```

## 功能特性

### 身份验证 (Auth)
- 用户登录/注册
- JWT令牌管理
- Cognito集成
- 用户信息管理

### 家庭管理 (Family)
- 创建家庭
- 查看家庭列表
- 更新家庭信息
- 删除家庭
- 家庭成员管理

## 技术栈

- **运行时**: Node.js 18.x
- **语言**: TypeScript
- **框架**: AWS Lambda
- **数据库**: DynamoDB
- **身份验证**: AWS Cognito
- **基础设施**: Terraform
- **部署**: Serverless Framework
- **日志**: Winston
- **验证**: Joi

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp env.example .env
# 编辑 .env 文件，设置必要的环境变量
```

### 3. 部署基础设施

```bash
# 初始化Terraform
npm run terraform:init

# 规划部署
npm run terraform:plan

# 应用基础设施
npm run terraform:apply
```

### 4. 部署Lambda函数

```bash
npm run deploy
```

### 5. 本地开发

```bash
# 启动本地开发服务器
npm run local
```

## API 端点

### 身份验证端点

- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /auth/me` - 获取当前用户信息

### 家庭管理端点

- `POST /family` - 创建家庭
- `GET /family` - 获取用户家庭列表
- `GET /family/{id}` - 获取特定家庭信息
- `PUT /family/{id}` - 更新家庭信息
- `DELETE /family/{id}` - 删除家庭
- `POST /family/{id}/members` - 添加家庭成员
- `DELETE /family/{id}/members/{memberId}` - 删除家庭成员

## 开发指南

### 代码规范

- 使用TypeScript严格模式
- 遵循ESLint规则
- 使用Prettier格式化代码
- 编写单元测试和集成测试

### 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

### 代码检查

```bash
# 运行ESLint检查
npm run lint

# 自动修复ESLint问题
npm run lint:fix
```

## 部署

```bash
npm run deploy
```

## 监控和日志

- CloudWatch Logs用于日志收集
- 使用Winston进行结构化日志记录
- 支持不同日志级别

## 安全考虑

- 使用Cognito进行身份验证
- API Gateway限流
- DynamoDB访问控制
- 环境变量管理
- 输入验证和清理

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License
