# AWS 生产环境配置

aws_region         = "ap-southeast-1"
project_name       = "lambda-spacetalk"
environment        = "prod"
cors_origins       = ["https://yourdomain.com"]
log_retention_days = 30

# AWS 真实环境
use_localstack = false

