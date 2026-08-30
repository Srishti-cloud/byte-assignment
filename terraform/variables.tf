variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "byte-assignment"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "Private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "admin_cidr" {
  description = "CIDR allowed to SSH into EC2 instances"
  type        = string
  default     = "0.0.0.0/0"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "byteapp"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "byteadmin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  default     = "BytePass123!"
  sensitive   = true
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI to use for EC2"
  type        = string
  default     = "ami-0c02fb55956c7d316"
}

variable "docker_username" {
  description = "Docker Hub username used for app images"
  type        = string
  default     = "srishtisingh13"
}

variable "docker_password" {
  description = "Docker Hub password or access token"
  type        = string
  sensitive   = true
  
}

variable "docker_image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}
