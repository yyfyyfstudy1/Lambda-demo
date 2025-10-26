# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "lambda_auth" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}-auth"
  retention_in_days = var.log_retention_days
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "lambda_family" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}-family"
  retention_in_days = var.log_retention_days
  tags              = local.common_tags
}
