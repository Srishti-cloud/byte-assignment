output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "load_balancer_dns" {
  value = aws_lb.main.dns_name
}

output "database_endpoint" {
  value = aws_db_instance.postgres.address
}

output "ec2_public_ip" {
  value = aws_instance.app.public_ip
}
