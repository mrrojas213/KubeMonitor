#!/usr/bin/env bash
# Checks that piece 1 (network + EKS + ECR) came up correctly.
# Run from the repo root after `terraform apply` finishes.
set -euo pipefail

TF_DIR="infra/terraform"
REGION=$(terraform -chdir="$TF_DIR" output -raw region)
CLUSTER=$(terraform -chdir="$TF_DIR" output -raw cluster_name)

echo "==> Pointing kubectl at $CLUSTER ($REGION)"
aws eks update-kubeconfig --region "$REGION" --name "$CLUSTER"

echo "==> Worker nodes (expect 2 Ready, one per AZ)"
kubectl get nodes -L topology.kubernetes.io/zone

echo "==> System pods (coredns, aws-node, kube-proxy should be Running)"
kubectl get pods -n kube-system

echo "==> Smoke test: run nginx, confirm it schedules, delete it"
kubectl create deployment smoke --image=public.ecr.aws/nginx/nginx:stable --replicas=2
kubectl rollout status deployment/smoke --timeout=120s
kubectl get pods -l app=smoke -o wide
kubectl delete deployment smoke

echo "==> ECR repositories"
terraform -chdir="$TF_DIR" output ecr_repository_urls

echo "All checks passed."
