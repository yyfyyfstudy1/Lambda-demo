#!/bin/bash

# 使用 Terraform 在 LocalStack 中配置基础设施

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  使用 Terraform 配置 LocalStack"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 LocalStack 是否运行
log_info "检查 LocalStack..."
if ! curl -s http://localhost:4566/_localstack/health > /dev/null; then
    log_info "LocalStack 未运行，正在启动..."
    docker-compose up -d localstack
    sleep 10
fi

cd terraform

# 初始化 Terraform
log_info "初始化 Terraform..."
terraform init

# 规划部署
log_info "规划 LocalStack 部署..."
terraform plan -var-file=environments/local.tfvars

# 应用配置
echo ""
read -p "是否继续部署到 LocalStack? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "部署到 LocalStack..."
    terraform apply -var-file=environments/local.tfvars -auto-approve
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ LocalStack 基础设施部署完成！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 显示输出
    terraform output
else
    log_info "部署取消"
fi

cd ..

