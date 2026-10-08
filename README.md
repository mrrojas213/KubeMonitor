# KubeMonitor
KubeMonitor is a lightweight AWS and Kubernetes observability dashboard inspired by Grafana. It monitors applications running on Amazon EKS, tracks Pod and worker-node health, detects unhealthy services and deployment issues, and demonstrates Kubernetes self-healing. It also uses CloudWatch and CloudTrail for monitoring, SNS for alerts, and CI/CD workflows for automated deployments.

## Build plan

| Piece | What | Status |
|---|---|---|
| 1 | **Infrastructure** — VPC, 2 AZs, public/private subnets, NAT, EKS cluster, 2 worker nodes, ECR repos (Terraform) | ✅ `infra/terraform` |
| 2 | **App** — Next.js dashboard (`frontend/dashboard`) + Express API (`backend/api`), Dockerfiles | in progress |
| 3 | **Kubernetes manifests** — Deployments with probes, Services, RBAC (read-only ServiceAccount), load balancer | |
| 4 | **CI/CD** — GitHub Actions: build → push to ECR → deploy to EKS, Terraform apply/destroy from Actions | ✅ see [docs/CICD.md](docs/CICD.md) |
| 5 | **Monitoring** — CloudWatch Container Insights, alarms → SNS email, CloudTrail → S3 | |
| 6 | **Self-healing demo** — kill pods / drain a node, watch recovery on the dashboard | |

---

## Piece 1: Infrastructure (AWS Academy Learner Lab)

### What it creates

- VPC `10.0.0.0/16` across 2 Availability Zones
- 2 public subnets (load balancer, NAT gateway) and 2 private subnets (worker nodes)
- 1 Internet Gateway, 1 NAT Gateway
- EKS cluster (Kubernetes 1.35) using the pre-created **LabRole**
- Managed node group: 2 × `t3.medium`, one per AZ, in the private subnets
- ECR repositories `kubemonitor-web` and `kubemonitor-api`

### Learner Lab rules this code works around

- **No IAM role creation.** The cluster and nodes both use `LabRole` (looked up, never created).
- **Regions:** only `us-east-1` or `us-west-2`.
- **Instance sizes:** nano–large only, so nodes are `t3.medium`.
- **Credentials expire** every lab session. Re-copy them each time you start the lab.

### Prerequisites (on your laptop)

- Terraform ≥ 1.10, AWS CLI v2, kubectl

### Deploy

1. In Learner Lab, click **Start Lab** and wait for the dot to turn green.
2. Click **AWS Details → AWS CLI: Show**, and paste the block into `~/.aws/credentials`
   (replace the whole `[default]` section).
3. Check it works:
   ```bash
   aws sts get-caller-identity
   ```
4. Create the infrastructure (takes about 15–20 minutes, mostly the EKS control plane):
   ```bash
   cd infra/terraform
   # Or skip the laptop entirely: Actions tab → Infra → apply (see docs/CICD.md)
   cp terraform.tfvars.example terraform.tfvars
   ../../scripts/bootstrap-tf-state.sh   # run from repo root; creates shared S3 state (once)
   terraform init -backend-config=backend.hcl
   terraform plan
   terraform apply
   ```
5. Verify from the repo root:
   ```bash
   chmod +x scripts/verify-cluster.sh
   ./scripts/verify-cluster.sh
   ```
   You should see 2 nodes `Ready` in two different zones, and the nginx smoke test rolling out.

### ⚠️ Protect your lab credits — destroy when you stop working

Ending a lab session stops the EC2 nodes, but the **EKS control plane and NAT gateway keep
charging credits** around the clock. Rough rate with everything up is about $0.25–0.30/hour,
or roughly $6–7/day, which drains a typical Learner Lab budget fast.

```bash
cd infra/terraform
terraform destroy
```

Recreating takes ~15–20 minutes, so a good rhythm is: `apply` at the start of a work session,
`destroy` at the end. Check remaining credits on the Learner Lab page before demo day.

**Team note:** Terraform state lives in S3 with locking, so anyone can run apply/destroy
(locally or from the Infra workflow) without clobbering each other. Everyone must use the
**same** Learner Lab account.

### Troubleshooting

| Symptom | Fix |
|---|---|
| `ExpiredToken` / `InvalidClientTokenId` | Lab session ended. Restart lab and re-paste credentials. |
| `not authorized to perform: iam:CreateRole` | Something is trying to create a role. Everything here should use `LabRole`. |
| `kubectl` says `Unauthorized` | Run the `configure_kubectl` output command again with fresh credentials. |
| Nodes `NotReady` after restarting the lab | Instances were stopped. Wait a few minutes for them to start and rejoin. |
| Version error on create | 1.35 may be unavailable in the lab. Try `cluster_version = "1.34"` (standard support until Dec 2026). |
