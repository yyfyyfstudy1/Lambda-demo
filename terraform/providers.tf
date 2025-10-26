provider "aws" {
  region = var.aws_region

  # LocalStack 配置
  skip_credentials_validation = var.use_localstack
  skip_metadata_api_check     = var.use_localstack
  skip_requesting_account_id  = var.use_localstack

  # 如果使用 LocalStack，覆盖所有 AWS 服务端点
  endpoints {
    apigateway = var.use_localstack ? var.localstack_endpoint : null
    cloudwatch = var.use_localstack ? var.localstack_endpoint : null
    dynamodb   = var.use_localstack ? var.localstack_endpoint : null
    ec2        = var.use_localstack ? var.localstack_endpoint : null
    iam        = var.use_localstack ? var.localstack_endpoint : null
    lambda     = var.use_localstack ? var.localstack_endpoint : null
    s3         = var.use_localstack ? var.localstack_endpoint : null
    cognitoidp = var.use_localstack ? var.localstack_endpoint : null
    sts        = var.use_localstack ? var.localstack_endpoint : null
  }

  # LocalStack 使用假凭证
  access_key = var.use_localstack ? "test" : null
  secret_key = var.use_localstack ? "test" : null
}
