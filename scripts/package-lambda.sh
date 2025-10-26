#!/bin/bash

# Lambda 打包脚本
# 用于正确打包Lambda函数及其依赖

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 清理旧的打包文件
log_info "清理旧的打包文件..."
rm -rf temp-lambda
rm -f dist/handlers/*.zip

# 复制 package.json 到 dist/ 用于 SAM CLI
log_info "准备 SAM CLI 依赖文件..."
cp package.json dist/ 2>/dev/null || true
cp package-lock.json dist/ 2>/dev/null || true

# 创建临时目录
mkdir -p temp-lambda/auth/handlers
mkdir -p temp-lambda/family/handlers

log_info "打包 auth Lambda..."

# 复制 auth handler
cp dist/handlers/auth.js temp-lambda/auth/handlers/
cp dist/handlers/auth.js.map temp-lambda/auth/handlers/ 2>/dev/null || true

# 复制共享依赖
cp -r dist/config temp-lambda/auth/
cp -r dist/services temp-lambda/auth/
cp -r dist/types temp-lambda/auth/
cp -r dist/utils temp-lambda/auth/

# 复制 node_modules
log_info "复制 node_modules..."
cp -r node_modules temp-lambda/auth/

# 创建 auth ZIP
cd temp-lambda/auth
zip -r ../../dist/handlers/auth.zip . -q
cd ../..

log_info "auth Lambda 打包完成"

log_info "打包 family Lambda..."

# 复制 family handler
cp dist/handlers/family.js temp-lambda/family/handlers/
cp dist/handlers/family.js.map temp-lambda/family/handlers/ 2>/dev/null || true

# 复制共享依赖
cp -r dist/config temp-lambda/family/
cp -r dist/services temp-lambda/family/
cp -r dist/types temp-lambda/family/
cp -r dist/utils temp-lambda/family/

# 复制 node_modules
log_info "复制 node_modules..."
cp -r node_modules temp-lambda/family/

# 创建 family ZIP
cd temp-lambda/family
zip -r ../../dist/handlers/family.zip . -q
cd ../..

log_info "family Lambda 打包完成"

# 清理临时目录
log_info "清理临时目录..."
rm -rf temp-lambda

log_info "所有 Lambda 函数打包完成！"
log_info "ZIP 文件位置:"
log_info "  - dist/handlers/auth.zip"
log_info "  - dist/handlers/family.zip"

