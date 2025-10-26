#!/bin/bash

# 启动完整的本地开发环境

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo -e "${BLUE}▶${NC} $1"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Lambda SpaceTalk - 本地开发环境启动"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 Docker
log_step "检查 Docker..."
if ! docker ps &> /dev/null; then
    log_warn "Docker 未运行，请启动 Docker Desktop"
    exit 1
fi
log_info "Docker 运行正常"

# 启动 LocalStack
log_step "启动 LocalStack..."
if docker ps | grep -q lambda-spacetalk-localstack; then
    log_info "LocalStack 已在运行"
else
    docker-compose up -d localstack
    log_info "等待 LocalStack 启动..."
    sleep 10
fi

# 检查 LocalStack 健康状态
log_step "检查 LocalStack 状态..."
curl -s http://localhost:4566/_localstack/health | grep -q "running" && \
    log_info "LocalStack 健康检查通过" || \
    log_warn "LocalStack 可能尚未完全启动"

# 初始化 AWS 资源
log_step "初始化 LocalStack AWS 资源..."
bash scripts/localstack-init.sh

# 编译代码
log_step "编译 TypeScript 代码..."
npm run build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 本地环境启动完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 服务信息："
echo "  LocalStack 端点: http://localhost:4566"
echo "  测试用户: test@example.com / Test1234!"
echo ""
echo "🧪 开始测试："
echo ""
echo "  方法 1 - 使用 WebStorm/VS Code:"
echo "    选择配置 → 点击 Debug (F5)"
echo ""
echo "  方法 2 - 启动本地 API:"
echo "    sam local start-api --template template-local.yaml --docker-network lambda-spacetalk_lambda-network"
echo "    访问: http://localhost:3000"
echo ""
echo "  方法 3 - 直接调用函数:"
echo "    sam local invoke AuthFunction --event events/auth-login.json --template template-local.yaml"
echo ""
echo "🛑 停止环境:"
echo "  docker-compose down"
echo ""
echo "📚 查看 LocalStack 日志:"
echo "  docker-compose logs -f localstack"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

