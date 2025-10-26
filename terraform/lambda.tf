# Lambda Functions
resource "aws_lambda_function" "auth" {
  filename         = "../dist/handlers/auth.zip"
  function_name    = "${var.project_name}-${var.environment}-auth"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "handlers/auth.handler"
  source_code_hash = filebase64sha256("../dist/handlers/auth.zip")
  runtime          = "nodejs18.x"
  timeout          = 30
  memory_size      = 512

  environment {
    variables = {
      STAGE                       = var.environment
      REGION                      = var.aws_region
      DYNAMODB_TABLE_PREFIX       = "${var.project_name}-${var.environment}"
      COGNITO_USER_POOL_ID        = aws_cognito_user_pool.main.id
      COGNITO_USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.main.id
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda_auth]
  tags       = local.common_tags
}

resource "aws_lambda_function" "family" {
  filename         = "../dist/handlers/family.zip"
  function_name    = "${var.project_name}-${var.environment}-family"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "handlers/family.handler"
  source_code_hash = filebase64sha256("../dist/handlers/family.zip")
  runtime          = "nodejs18.x"
  timeout          = 30
  memory_size      = 512

  environment {
    variables = {
      STAGE                       = var.environment
      REGION                      = var.aws_region
      DYNAMODB_TABLE_PREFIX       = "${var.project_name}-${var.environment}"
      COGNITO_USER_POOL_ID        = aws_cognito_user_pool.main.id
      COGNITO_USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.main.id
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda_family]
  tags       = local.common_tags
}

# Lambda Permissions
resource "aws_lambda_permission" "auth_proxy" {
  statement_id  = "AllowExecutionFromAPIGatewayAuth"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "family" {
  statement_id  = "AllowExecutionFromAPIGatewayFamily"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.family.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "family_proxy" {
  statement_id  = "AllowExecutionFromAPIGatewayFamilyProxy"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.family.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}
