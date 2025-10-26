# Lambda 修复总结

## 修复日期
2025年10月25日

## 修复的问题

### 1. Lambda ZIP文件结构问题
**问题**: Lambda ZIP文件中缺少正确的目录结构和依赖
- ZIP文件中handler文件路径与Terraform配置不匹配
- 缺少`node_modules`依赖，导致运行时错误

**解决方案**:
- 创建了`scripts/package-lambda.sh`打包脚本
- 正确构建ZIP文件结构，handler位于`handlers/`目录下
- 将`node_modules`打包到ZIP文件中
- 更新`package.json`添加`package`和`deploy`命令

### 2. API Gateway路由配置问题
**问题**: API Gateway配置冗余且存在冲突
- `/auth`资源上有多个重复的POST方法（login/register）
- `auth_proxy`路由需要Cognito授权，导致公开端点无法访问

**解决方案**:
- 简化API Gateway配置，使用`{proxy+}`路由处理所有子路径
- 将`auth_proxy`的授权改为NONE，由Lambda内部处理授权
- 为所有proxy路由添加OPTIONS方法支持CORS预检

### 3. Lambda路径处理逻辑问题  
**问题**: Lambda handler无法正确处理路径
- API Gateway有时传递带stage前缀的路径（`/dev/auth/login`）
- 有时传递不带前缀的路径（`/auth/login`）
- 原有的路径清理逻辑会错误处理不带前缀的路径

**解决方案**:
- 更新`auth.ts`和`family.ts`的路径处理逻辑
- 智能检测路径是否包含stage前缀
- 统一处理两种路径格式

## 部署的资源

### Lambda函数
- **lambda-spacetalk-dev-auth**: 认证处理器
  - Handler: `handlers/auth.handler`
  - Runtime: Node.js 18.x
  - Memory: 512 MB
  - Timeout: 30 seconds

- **lambda-spacetalk-dev-family**: 家庭管理处理器
  - Handler: `handlers/family.handler`
  - Runtime: Node.js 18.x
  - Memory: 512 MB
  - Timeout: 30 seconds

### API Gateway
- **API ID**: `tr3khtk0v4`
- **Base URL**: `https://tr3khtk0v4.execute-api.ap-southeast-1.amazonaws.com`
- **Stage**: `dev`
- **Region**: `ap-southeast-1` (新加坡)

### 端点配置

#### 认证端点 (无需授权)
- `POST /dev/auth/login` - 用户登录
- `POST /dev/auth/register` - 用户注册

#### 认证端点 (需要授权)
- `GET /dev/auth/me` - 获取当前用户信息

#### 家庭管理端点 (需要Cognito授权)
- `GET /dev/family` - 获取用户的家庭列表
- `POST /dev/family` - 创建新家庭
- `GET /dev/family/{id}` - 获取特定家庭
- `PUT /dev/family/{id}` - 更新家庭信息
- `DELETE /dev/family/{id}` - 删除家庭
- `POST /dev/family/{id}/members` - 添加家庭成员
- `DELETE /dev/family/{id}/members/{memberId}` - 删除家庭成员

### AWS资源
- **Cognito User Pool**: `ap-southeast-1_BXjpIpfBI`
- **Cognito Client ID**: `116nf4faiv8jd0eccbkbtci0dm`
- **DynamoDB表**:
  - `lambda-spacetalk-dev-users`
  - `lambda-spacetalk-dev-families`

## 测试结果

### ✅ 成功的测试
1. **OPTIONS预检请求**: 返回200，正确的CORS头
2. **Lambda函数直接调用**: 正常响应
3. **API Gateway路由**: 正确路由到Lambda函数
4. **路径处理**: 支持带/不带stage前缀的路径

### ⚠️ 注意事项
- 注册功能需要配置Cognito用户池的验证设置
- 某些Cognito认证流程可能需要额外配置

## 部署命令

### 完整部署
```bash
npm run deploy
```

### 仅构建
```bash
npm run build
```

### 仅打包
```bash
npm run package
```

### Terraform操作
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 文件更改
- ✅ 新增: `scripts/package-lambda.sh` - Lambda打包脚本
- ✅ 修改: `package.json` - 添加build/package/deploy命令
- ✅ 修改: `terraform/main.tf` - 简化API Gateway配置
- ✅ 修改: `src/handlers/auth.ts` - 修复路径处理逻辑
- ✅ 修改: `src/handlers/family.ts` - 修复路径处理逻辑

## 后续建议

1. **测试覆盖**: 添加集成测试验证完整的API流程
2. **监控**: 设置CloudWatch告警监控Lambda错误率
3. **优化**: 考虑使用Lambda Layer管理共享依赖
4. **安全**: 实施API限流和请求验证
5. **文档**: 使用OpenAPI/Swagger文档化API端点

## 快速测试

```bash
# 测试OPTIONS (CORS预检)
curl -X OPTIONS https://tr3khtk0v4.execute-api.ap-southeast-1.amazonaws.com/dev/auth/login

# 测试登录端点
curl -X POST https://tr3khtk0v4.execute-api.ap-southeast-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# 测试注册端点
curl -X POST https://tr3khtk0v4.execute-api.ap-southeast-1.amazonaws.com/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo1234!","username":"demouser"}'
```

## 状态
✅ **两个Lambda函数已成功修复并部署**

