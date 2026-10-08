# Learner Lab can't create IAM roles, so the cluster and the nodes both reuse
# the pre-created LabRole instead of the usual dedicated EKS roles.
data "aws_iam_role" "lab" {
  name = var.lab_role_name
}

resource "aws_eks_cluster" "main" {
  name     = local.cluster_name
  version  = var.cluster_version
  role_arn = data.aws_iam_role.lab.arn

  vpc_config {
    subnet_ids              = concat(aws_subnet.private[*].id, aws_subnet.public[*].id)
    endpoint_public_access  = true # so kubectl works from your laptop
    endpoint_private_access = true # so nodes reach the API inside the VPC
  }

  access_config {
    authentication_mode = "API_AND_CONFIG_MAP"
    # Whoever runs terraform apply (your lab session role) gets cluster admin.
    # The role ARN stays the same across lab sessions, so access survives
    # credential rotation.
    bootstrap_cluster_creator_admin_permissions = true
  }

  # Fail instead of silently paying the extended-support surcharge if the
  # version is ever out of standard support.
  upgrade_policy {
    support_type = "STANDARD"
  }

  # Control-plane logs. Feeds the CloudWatch side of the project later.
  enabled_cluster_log_types = ["api", "audit"]

  depends_on = [
    aws_route_table_association.private,
    aws_route_table_association.public,
  ]
}

resource "aws_eks_node_group" "workers" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-workers"
  node_role_arn   = data.aws_iam_role.lab.arn
  subnet_ids      = aws_subnet.private[*].id # one node per AZ, private subnets
  instance_types  = [var.node_instance_type]
  capacity_type   = "ON_DEMAND"

  scaling_config {
    desired_size = var.node_desired_size
    min_size     = var.node_min_size
    max_size     = var.node_max_size
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    project = var.project_name
  }

  # Lets the desired count drift (e.g. during a node-failure demo) without
  # Terraform fighting the Auto Scaling group on the next apply.
  lifecycle {
    ignore_changes = [scaling_config[0].desired_size]
  }

  depends_on = [aws_nat_gateway.main]
}
