# Lambda 本地测试示例

## ✅ 环境已配置完成

已安装并验证：
- ✅ AWS SAM CLI 1.145.2
- ✅ Docker 28.2.2
- ✅ Node.js 环境
- ✅ Lambda 函数成功运行

## 快速测试示例

### 1. 测试单个 Lambda 函数

```bash
# 测试登录（会返回401，因为用户不存在，这是正常的）
sam local invoke AuthFunction --event events/auth-login.json

# 测试注册
sam local invoke AuthFunction --event events/auth-register.json

# 测试家庭列表（需要用户ID）
sam local invoke FamilyFunction --event events/family-list.json

# 测试创建家庭
sam local invoke FamilyFunction --event events/family-create.json
```

### 2. 启动本地API服务器（推荐）

```bash
# 启动本地 API Gateway
sam local start-api

# 在另一个终端测试：
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo1234!","username":"demouser"}'

# 使用 httpie (更美观)
http POST localhost:3000/auth/login email=test@example.com password=Test1234!
```

### 3. 使用 VS Code 调试（最佳体验）

#### 步骤：
1. **安装 AWS Toolkit 扩展**
   ```
   按 ⇧⌘X → 搜索 "AWS Toolkit" → 安装
   ```

2. **打开调试面板**
   ```
   按 ⇧⌘D 或点击左侧 Run and Debug 图标
   ```

3. **选择调试配置**
   - `Auth:Login (local)` - 测试登录
   - `Auth:Register (local)` - 测试注册
   - `Family:List (local)` - 获取家庭列表
   - `Family:Create (local)` - 创建家庭

4. **运行调试**
   ```
   按 F5 开始调试
   ```

5. **设置断点**
   - 点击代码行号左侧设置断点
   - Lambda 执行到断点时会暂停
   - 可以检查变量值、调用栈等

## 修改测试数据

### 方法 1: 编辑事件文件

```bash
# 编辑 events/auth-login.json
{
  "httpMethod": "POST",
  "path": "/auth/login",
  "body": "{\"email\":\"myemail@test.com\",\"password\":\"MyPassword123!\"}"
}
```

### 方法 2: 编辑 VS Code 配置

编辑 `.vscode/launch.json` 中的 payload 部分。

### 方法 3: 创建新的测试事件

```bash
# 创建自定义测试事件
cat > events/my-test.json << 'EOF'
{
  "httpMethod": "POST",
  "path": "/auth/me",
  "headers": {},
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "my-user-id",
        "email": "test@example.com"
      }
    }
  }
}
EOF

# 使用自定义事件测试
sam local invoke AuthFunction --event events/my-test.json
```

## 环境变量配置

### 查看当前环境变量
在 `template.yaml` 中的 `Globals.Function.Environment.Variables` 查看。

### 临时修改环境变量

```bash
# 创建环境变量文件
cat > env.json << 'EOF'
{
  "AuthFunction": {
    "STAGE": "local",
    "REGION": "ap-southeast-1",
    "LOG_LEVEL": "debug"
  }
}
EOF

# 使用环境变量文件
sam local invoke AuthFunction \
  --event events/auth-login.json \
  --env-vars env.json
```

## 查看日志

### 本地日志
SAM CLI 会在控制台实时显示所有日志。

### 远程日志（AWS CloudWatch）

```bash
# 实时查看远程 Lambda 日志
aws logs tail /aws/lambda/lambda-spacetalk-dev-auth \
  --region ap-southeast-1 \
  --follow

# 查看最近30分钟的日志
aws logs tail /aws/lambda/lambda-spacetalk-dev-auth \
  --region ap-southeast-1 \
  --since 30m
```

## 性能测试

### 使用 Apache Bench

```bash
# 启动本地 API
sam local start-api &

# 性能测试
ab -n 100 -c 10 \
  -T 'application/json' \
  -p events/auth-login.json \
  http://localhost:3000/auth/login
```

### 使用 hey

```bash
# 安装 hey
brew install hey

# 运行负载测试
hey -n 100 -c 10 \
  -m POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}' \
  http://localhost:3000/auth/login
```

## 调试技巧

### 1. 添加调试日志

```typescript
// 在代码中添加
console.log('Debug:', { variable: someVar });
logger.info('Debug info', { data: someData });
```

### 2. 使用断点（VS Code）

```
1. 点击行号左侧设置断点
2. F5 启动调试
3. 代码执行到断点时会暂停
4. 鼠标悬停查看变量值
5. 使用调试控制台执行表达式
```

### 3. 检查请求/响应

```bash
# 查看完整请求和响应
sam local invoke AuthFunction \
  --event events/auth-login.json \
  2>&1 | tee lambda-output.log
```

### 4. 热重载（修改代码后自动重启）

```bash
# 使用 nodemon 监听文件变化
npm install -g nodemon

# 创建脚本 dev.sh
cat > dev.sh << 'EOF'
#!/bin/bash
nodemon --watch src --ext ts --exec "npm run build && sam local start-api"
EOF
chmod +x dev.sh

# 运行
./dev.sh
```

## 常见测试场景

### 1. 测试认证流程

```bash
# 1. 注册用户
sam local invoke AuthFunction --event events/auth-register.json

# 2. 登录获取token
sam local invoke AuthFunction --event events/auth-login.json

# 3. 使用token访问受保护的端点
# (需要创建包含token的事件文件)
```

### 2. 测试CRUD操作

```bash
# 创建
sam local invoke FamilyFunction --event events/family-create.json

# 读取
sam local invoke FamilyFunction --event events/family-list.json

# 更新（需要创建事件文件）
# 删除（需要创建事件文件）
```

### 3. 测试错误处理

```bash
# 测试无效输入
cat > events/invalid-login.json << 'EOF'
{
  "httpMethod": "POST",
  "path": "/auth/login",
  "body": "{\"email\":\"invalid\",\"password\":\"\"}"
}
EOF

sam local invoke AuthFunction --event events/invalid-login.json
```

## 对比本地和远程环境

### 测试本地环境
```bash
sam local invoke AuthFunction --event events/auth-login.json
```

### 测试远程环境
```bash
aws lambda invoke \
  --function-name lambda-spacetalk-dev-auth \
  --region ap-southeast-1 \
  --payload file://events/auth-login.json \
  response.json

cat response.json | jq .
```

## 快捷脚本

### 创建测试脚本

```bash
# 保存为 quick-test.sh
#!/bin/bash
echo "🧪 快速测试 Lambda"

# 编译
npm run build

# 测试 Auth
echo "\n1️⃣  测试登录"
sam local invoke AuthFunction --event events/auth-login.json | tail -5

echo "\n2️⃣  测试注册"  
sam local invoke AuthFunction --event events/auth-register.json | tail -5

echo "\n✅ 测试完成"
```

```bash
chmod +x quick-test.sh
./quick-test.sh
```

## 故障排除

### 问题：Lambda 超时
**解决**: 增加 template.yaml 中的 Timeout 值

### 问题：找不到模块
**解决**: 运行 `npm run build` 重新编译

### 问题：Docker 错误
**解决**: 确保 Docker Desktop 正在运行

### 问题：端口被占用
**解决**: 
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或使用不同端口
sam local start-api --port 3001
```

## 下一步

- ✅ 环境配置完成
- ✅ 本地测试成功
- 📝 编写单元测试: `npm test`
- 📝 编写集成测试
- 🚀 配置 CI/CD

## 相关文档

- `QUICK_START.md` - 快速入门
- `LOCAL_TESTING.md` - 详细测试文档  
- `DEPLOYMENT_SUMMARY.md` - 部署总结

