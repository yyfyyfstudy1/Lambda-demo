# LocalStack 本地开发环境配置

aws_region         = "us-east-1"
project_name       = "lambda-spacetalk"
environment        = "local"
cors_origins       = ["*"]
log_retention_days = 7

# LocalStack 特定配置
use_localstack      = true
localstack_endpoint = "http://localhost:4566"

