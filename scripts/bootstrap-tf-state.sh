#!/usr/bin/env bash
# One-time: creates the S3 bucket for shared Terraform state and writes
# infra/terraform/backend.hcl so local `terraform init` uses the same state
# as GitHub Actions. Safe to run again.
#
# If you already ran `terraform apply` with LOCAL state (piece 1 before this
# change), run `terraform init -backend-config=backend.hcl -migrate-state`
# afterwards and answer "yes" to copy the existing state into S3.
set -euo pipefail
cd "$(dirname "$0")/.."   # repo root, wherever this is called from

REGION="${AWS_REGION:-us-east-1}"
ACCT=$(aws sts get-caller-identity --query Account --output text)
BUCKET="kubemonitor-tfstate-$ACCT"

if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "Bucket $BUCKET already exists."
else
  echo "Creating $BUCKET in $REGION"
  aws s3 mb "s3://$BUCKET" --region "$REGION"
  aws s3api put-bucket-versioning --bucket "$BUCKET" \
    --versioning-configuration Status=Enabled
fi

cat > infra/terraform/backend.hcl <<EOF
bucket       = "$BUCKET"
key          = "kubemonitor/terraform.tfstate"
region       = "$REGION"
use_lockfile = true
EOF

echo "Wrote infra/terraform/backend.hcl. Next:"
echo "  cd infra/terraform && terraform init -backend-config=backend.hcl"
