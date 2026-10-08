# One image repository per tier: web (Next.js) and api (Express).
resource "aws_ecr_repository" "app" {
  for_each = toset(["web", "api"])

  name                 = "${var.project_name}-${each.key}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true # lets terraform destroy remove repos that still hold images

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Keep only the 10 newest images per repo so storage stays near zero.
resource "aws_ecr_lifecycle_policy" "app" {
  for_each   = aws_ecr_repository.app
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}
