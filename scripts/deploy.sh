#!/bin/bash

# Lambda SpaceTalk 部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "开始部署..."

# 检查必要的工具
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform 未安装"
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI 未安装"
        exit 1
    fi
    
    log_info "依赖检查完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    npm install
    log_info "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    npm run build
    log_info "项目构建完成"
}

# 部署基础设施
deploy_infrastructure() {
    log_info "部署基础设施..."
    
    cd terraform
    
    # 初始化Terraform
    log_info "初始化Terraform..."
    terraform init
    
    # 规划部署
    log_info "规划Terraform部署..."
    terraform plan
    
    # 应用部署
    log_info "应用Terraform配置..."
    terraform apply -auto-approve
    
    cd ..
    log_info "基础设施部署完成"
}

# 部署Lambda函数
deploy_lambda() {
    log_info "部署Lambda函数..."
    npm run deploy
    log_info "Lambda函数部署完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    npm test
    log_info "测试完成"
}

# 主函数
main() {
    log_info "开始部署流程..."
    
    check_dependencies
    install_dependencies
    build_project
    run_tests
    deploy_infrastructure
    deploy_lambda
    
    log_info "部署完成！"
    log_info "API端点: https://your-api-gateway-url"
    log_info "本地开发: npm run local"
}

# 执行主函数
main
