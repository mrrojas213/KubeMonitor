terraform {
  required_version = ">= 1.10.0" # 1.10+ needed for S3-native state locking

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }

  # Shared state in S3 so GitHub Actions and every teammate see the same
  # infrastructure. Bucket/key/region are passed at init time:
  #   locally:  terraform init -backend-config=backend.hcl   (made by scripts/bootstrap-tf-state.sh)
  #   in CI:    the Infra workflow passes them as flags
  backend "s3" {}
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = "KubeMonitor"
      ManagedBy = "Terraform"
    }
  }
}
