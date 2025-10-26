# WebStorm AWS Toolkit 调试指南

## 📦 已配置的运行配置

我已经为你创建了 4 个 WebStorm 运行配置文件（在 `.idea/runConfigurations/` 目录下）：

1. **Auth:Login (Local)** - 测试登录
2. **Auth:Register (Local)** - 测试注册
3. **Family:List (Local)** - 获取家庭列表
4. **Family:Create (Local)** - 创建家庭

## 🚀 使用方法

### 方法 1: 使用运行配置下拉菜单（推荐）

1. 在 WebStorm 顶部工具栏找到运行配置下拉菜单
2. 选择一个配置（如 "Auth:Login (Local)"）
3. 点击绿色 ▶️ 运行按钮，或点击 🐛 调试按钮
4. 查看底部的 Run 或 Debug 面板查看输出

### 方法 2: 通过菜单

1. 点击 **Run** → **Edit Configurations...**
2. 在左侧列表中会看到预配置的运行配置
3. 选择一个配置，点击 **Run** 或 **Debug**

### 方法 3: 使用快捷键

- **运行**: `⌃R` (Control + R)
- **调试**: `⌃D` (Control + D)

## 🔧 手动创建运行配置（如果自动配置不工作）

### 步骤 1: 打开配置
1. 点击 **Run** → **Edit Configurations...**
2. 点击左上角的 **+** 按钮
3. 选择 **AWS Lambda** → **Local**

### 步骤 2: 配置 Auth:Login

**名称**: `Auth:Login (Local)`

**Runtime**: `nodejs18.x`

**Handler**: `handlers/auth.handler`

**SAM CLI**:
- ✅ Build function inside a container
- ✅ Skip pulling images
- Template: `template.yaml`

**Input**:
选择 "Text" 并粘贴：
```json
{
  "httpMethod": "POST",
  "path": "/auth/login",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"email\":\"test@example.com\",\"password\":\"Test1234!\"}",
  "requestContext": {
    "requestId": "local-test",
    "authorizer": {}
  }
}
```

**Environment Variables**:
```
STAGE=dev
REGION=ap-southeast-1
DYNAMODB_TABLE_PREFIX=lambda-spacetalk-dev
COGNITO_USER_POOL_ID=ap-southeast-1_BXjpIpfBI
COGNITO_USER_POOL_CLIENT_ID=116nf4faiv8jd0eccbkbtci0dm
```

### 步骤 3: 重复创建其他配置

#### Family:List (Local)
- **Handler**: `handlers/family.handler`
- **Input**:
```json
{
  "httpMethod": "GET",
  "path": "/family",
  "headers": {},
  "requestContext": {
    "requestId": "local-test",
    "authorizer": {
      "claims": {
        "sub": "test-user-id-12345",
        "email": "test@example.com"
      }
    }
  }
}
```

#### Family:Create (Local)
- **Handler**: `handlers/family.handler`
- **Input**:
```json
{
  "httpMethod": "POST",
  "path": "/family",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"name\":\"我的家庭\",\"description\":\"这是我的家庭\"}",
  "requestContext": {
    "requestId": "local-test",
    "authorizer": {
      "claims": {
        "sub": "test-user-id-12345",
        "email": "test@example.com"
      }
    }
  }
}
```

## 🐛 调试技巧

### 1. 设置断点
- 点击代码行号左侧设置断点（红点）
- 使用调试模式运行（🐛 按钮或 ⌃D）
- 代码执行到断点时会暂停

### 2. 查看变量
- 在 Debug 面板的 Variables 标签查看变量值
- 鼠标悬停在代码上也能查看变量

### 3. 单步执行
- **Step Over** (F8): 执行下一行
- **Step Into** (F7): 进入函数内部
- **Step Out** (⇧F8): 跳出当前函数
- **Resume** (⌘⌥R): 继续执行到下一个断点

### 4. 评估表达式
- 在 Debug 面板中使用 Evaluate Expression (⌥F8)
- 可以执行任意代码查看结果

## 📝 使用事件文件（推荐）

如果 JSON 输入太长，可以使用事件文件：

### 方法 1: 在配置中引用文件

1. 编辑运行配置
2. 在 Input 部分，选择 **File** 而不是 **Text**
3. 选择事件文件，例如：`events/auth-login.json`

### 方法 2: 使用 SAM CLI 参数

在运行配置的 **Additional Local Invoke Parameters** 中添加：
```
--event events/auth-login.json
```

## 🔍 查看日志

### 在 WebStorm 中
- 运行/调试时，日志会自动显示在底部的 Run/Debug 面板
- 可以搜索、过滤日志

### 查看远程 CloudWatch 日志
```bash
# 在 WebStorm 内置终端中运行
aws logs tail /aws/lambda/lambda-spacetalk-dev-auth \
  --region ap-southeast-1 \
  --follow
```

## ⚙️ 配置 AWS 凭证

### 检查配置
在 WebStorm 中：
1. 打开 **Preferences** (⌘,)
2. 搜索 "AWS"
3. 在 **Tools** → **AWS** → **Connection** 中配置
4. 选择 **Profile** 并选择 `default`
5. Region: `ap-southeast-1`

### 或者使用命令行配置
```bash
aws configure
# AWS Access Key ID: your-key
# AWS Secret Access Key: your-secret
# Default region name: ap-southeast-1
# Default output format: json
```

## 🛠️ 故障排除

### 问题 1: 找不到 AWS Lambda 运行配置类型
**解决**: 
1. 安装 AWS Toolkit 插件
2. **Preferences** → **Plugins** → 搜索 "AWS Toolkit" → 安装
3. 重启 WebStorm

### 问题 2: SAM CLI 未找到
**解决**:
```bash
# 安装 SAM CLI（已安装）
brew install aws-sam-cli

# 在 WebStorm 中配置路径
# Preferences → Tools → AWS → SAM CLI
# 设置为: /opt/homebrew/bin/sam
```

### 问题 3: Docker 错误
**解决**:
- 确保 Docker Desktop 正在运行
- 在终端运行 `docker ps` 验证

### 问题 4: 构建失败
**解决**:
```bash
# 在 WebStorm 内置终端中运行
npm run build
```

### 问题 5: 模块找不到
**解决**:
- 确保 `template.yaml` 中的 `CodeUri` 设置为 `dist/`
- Handler 设置为 `handlers/auth.handler` 或 `handlers/family.handler`

## 📦 构建前准备

每次调试前确保代码已编译：

```bash
# 在 WebStorm 终端中运行
npm run build
```

或者创建一个 Before Launch 任务：
1. 编辑运行配置
2. 在底部找到 **Before Launch** 部分
3. 添加 **Run npm script** → 选择 `build`

## 🎯 快捷测试命令

### 在 WebStorm 终端中

```bash
# 测试单个函数
sam local invoke AuthFunction --event events/auth-login.json

# 启动本地 API
sam local start-api

# 运行测试脚本
./test-local.sh
```

## 📚 相关资源

- [WebStorm AWS Toolkit 文档](https://www.jetbrains.com/help/webstorm/aws.html)
- [AWS SAM CLI 文档](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- 项目文档:
  - `QUICK_START.md` - 快速入门
  - `LOCAL_TESTING.md` - 详细测试文档
  - `TEST_EXAMPLES.md` - 测试示例

## 💡 提示

1. **使用文件监听**: 安装 `nodemon` 实现代码热重载
2. **并行测试**: 可以同时运行多个配置
3. **保存配置**: 运行配置会自动保存在 `.idea/` 目录
4. **共享配置**: 可以将 `.idea/runConfigurations/` 提交到 Git

---

现在你可以在 WebStorm 中愉快地调试 Lambda 函数了！🚀

