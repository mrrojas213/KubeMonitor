variable "region" {
  description = "AWS region. Learner Lab only allows us-east-1 and us-west-2."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefix for resource names."
  type        = string
  default     = "kubemonitor"
}

variable "cluster_version" {
  description = "EKS Kubernetes version. Keep it in standard support; extended support costs 6x more per hour."
  type        = string
  default     = "1.35"
}

variable "lab_role_name" {
  description = "Pre-created IAM role used for both the EKS cluster and the worker nodes (Learner Lab blocks creating IAM roles)."
  type        = string
  default     = "LabRole"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "node_instance_type" {
  description = "Worker node size. Learner Lab caps EC2 at nano through large."
  type        = string
  default     = "t3.medium"
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_min_size" {
  type    = number
  default = 2
}

variable "node_max_size" {
  type    = number
  default = 3
}
