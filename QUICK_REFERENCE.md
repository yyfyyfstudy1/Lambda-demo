# ⚡ 快速参考

## 🚀 常用命令

### 本地开发（LocalStack）
```bash
npm run local:start          # 启动本地环境
npm run local:stop           # 停止环境
npm run local:status         # 查看资源状态
npm run local:dashboard      # 打开 Web Dashboard
npm run local:logs           # 查看日志
npm run local:restart        # 重启环境
npm run local:clean          # 完全清理
```

### 开发
```bash
npm run build                # 编译 + 打包
npm test                     # 运行测试
npm run lint                 # 代码检查
```

### 部署
```bash
npm run deploy               # 部署到 dev
npm run deploy:prod          # 部署到 prod
npm run terraform:plan       # 查看变更
```

## 🎯 三种调试方式

### 1. WebStorm（推荐）
- 选择运行配置 → F5 调试

### 2. 命令行
```bash
sam local invoke AuthFunction --event events/auth-login-local.json
```

### 3. 本地 API
```bash
sam local start-api --template template-local.yaml
curl http://localhost:3000/auth/login
```

## 📂 配置文件

| 文件 | 用途 |
|------|------|
| `docker-compose.yml` | LocalStack 容器 |
| `template-local.yaml` | SAM 本地配置 |
| `template.yaml` | SAM AWS 配置 |
| `terraform/environments/local.tfvars` | Terraform 本地 |
| `terraform/environments/dev.tfvars` | Terraform dev |
| `terraform/environments/prod.tfvars` | Terraform prod |

## 🔗 端点

| 环境 | 端点 |
|------|------|
| Local | http://localhost:3000 |
| LocalStack | http://localhost:4566 |
| Dev | https://tr3khtk0v4.execute-api.ap-southeast-1.amazonaws.com/dev |

## 📝 测试事件

- `events/auth-login-local.json` - 登录
- `events/auth-register.json` - 注册
- `events/family-list.json` - 家庭列表
- `events/family-create.json` - 创建家庭

## 💡 环境变量

查看 `env.local`（LocalStack）或 Terraform variables

