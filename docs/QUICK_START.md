# 🚀 快速开始 - 本地测试 Lambda

## 第一步：安装 AWS SAM CLI

```bash
# 使用 Homebrew 安装（推荐）
brew install aws-sam-cli

# 验证安装
sam --version
# 应该输出类似：SAM CLI, version 1.x.x
```

## 第二步：确保 Docker 运行

SAM CLI 需要 Docker 来模拟 Lambda 环境：

```bash
# 检查 Docker 是否运行
docker ps

# 如果未运行，启动 Docker Desktop
open -a Docker
```

## 第三步：测试 Lambda 函数

### 选项 A：使用 VS Code AWS Toolkit（最简单）

1. **安装 AWS Toolkit 扩展**
   - 打开 VS Code
   - 按 `⇧⌘X` 打开扩展
   - 搜索 "AWS Toolkit"
   - 点击安装

2. **使用调试配置**
   - 按 `⇧⌘D` 打开调试面板
   - 从下拉菜单选择：
     - `Auth:Login (local)` - 测试登录
     - `Auth:Register (local)` - 测试注册
     - `Family:List (local)` - 测试家庭列表
     - `Family:Create (local)` - 测试创建家庭
   - 按 `F5` 运行

3. **查看结果**
   - 调试控制台会显示 Lambda 响应
   - 可以在代码中设置断点调试

### 选项 B：使用命令行

```bash
# 1. 确保代码已编译
npm run build

# 2. 测试登录功能
sam local invoke AuthFunction \
  --event events/auth-login.json \
  --template template.yaml

# 3. 测试注册功能
sam local invoke AuthFunction \
  --event events/auth-register.json \
  --template template.yaml

# 4. 测试家庭功能
sam local invoke FamilyFunction \
  --event events/family-list.json \
  --template template.yaml
```

### 选项 C：启动本地 API 服务器

```bash
# 启动本地 API Gateway（端口 3000）
sam local start-api --template template.yaml

# 在另一个终端测试：
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

## 测试事件文件

我已经为你创建了以下测试事件（在 `events/` 目录）：

- ✅ `auth-login.json` - 测试登录
- ✅ `auth-register.json` - 测试注册
- ✅ `family-list.json` - 测试获取家庭列表
- ✅ `family-create.json` - 测试创建家庭

你可以编辑这些文件来修改测试数据。

## 常用命令

```bash
# 编译 TypeScript
npm run compile

# 打包 Lambda
npm run package

# 完整构建（编译 + 打包）
npm run build

# 运行单元测试
npm test

# 本地调用 Lambda
sam local invoke [FunctionName] --event [event-file]

# 启动本地 API
sam local start-api

# 查看远程日志
aws logs tail /aws/lambda/lambda-spacetalk-dev-auth --follow
```

## 调试技巧

### 1. 使用 VS Code 断点
- 在代码行号左侧点击设置断点
- 按 F5 启动调试
- Lambda 执行到断点时会暂停

### 2. 查看日志
```bash
# 查看本地 Lambda 日志（在调试控制台）
# 或查看远程日志：
aws logs tail /aws/lambda/lambda-spacetalk-dev-auth \
  --region ap-southeast-1 \
  --follow
```

### 3. 修改测试数据
编辑 `events/*.json` 文件或 `.vscode/launch.json` 中的 payload。

## 下一步

✅ 已配置完成：
- `template.yaml` - SAM 配置文件
- `.vscode/launch.json` - VS Code 调试配置
- `events/` 目录 - 测试事件文件
- `LOCAL_TESTING.md` - 详细测试文档

📖 阅读 `LOCAL_TESTING.md` 了解更多高级用法。

## 需要帮助？

- 📖 查看 `LOCAL_TESTING.md` 获取详细文档
- 🐛 调试问题？检查 Docker 是否运行
- 🔑 权限错误？运行 `aws configure` 配置凭证

