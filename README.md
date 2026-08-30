# 8Byte AI Assignment

This project is a small but complete assignment setup covering the core parts of a production-style application: app development, infrastructure provisioning, deployment automation, observability, and operational documentation. The goal was to build a working baseline that is easy to run locally and can be extended to a real cloud deployment without reworking the project structure.

## Architecture summary

- Frontend: static application served through NGINX
- Backend: Node.js + Express REST API
- Database: PostgreSQL, with a fallback path for local/demo usage
- Infrastructure: Terraform for AWS-based infrastructure
- CI/CD: GitHub Actions pipeline for pull requests, image builds, staging deploys, and a production approval gate
- Monitoring: Prometheus and Grafana, with Loki/Promtail for log collection

## Repository structure

- `backend/` – API service and tests
- `frontend/` – frontend UI
- `terraform/` – AWS infrastructure definitions
- `monitoring/` – Prometheus, Grafana, Loki, and Promtail config
- `.github/workflows/` – CI/CD workflow definitions
- `docs/` – approach and challenge notes
- `scripts/` – backup and secret-management examples

## Local setup

### Prerequisites

- Docker and Docker Compose
- Node.js 20+

### Run the full stack locally

```bash
docker-compose up --build
```

This starts the application stack and exposes the following endpoints:

- Frontend: http://localhost
- Backend health check: http://localhost:4000/health
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

### Run the backend directly

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The sample environment file is in `backend/.env.example`.

## Infrastructure provisioning

The Terraform configuration in `terraform/` includes:

- VPC with public and private subnets
- Internet gateway and NAT setup
- EC2 instance for app hosting
- Separate staging EC2 instance for pre-production deployment validation
- RDS PostgreSQL database
- Security groups for the load balancer, app layer, and database
- Application Load Balancer
- Output values for key resources

### Terraform commands

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

The setup is designed to follow a realistic AWS deployment pattern, with state management configured through a remote S3 backend as the expected production pattern.

Terraform also provisions a separate staging EC2 instance. Its public IP is printed as `staging_public_ip`; the staging workflow deploys the commit-tagged images through SSM and runs a local health check before the production approval gate. A second EC2 instance can incur cost outside AWS Free Tier allowances.

## Deployment automation

The workflow in `.github/workflows/ci-cd.yml` is designed to handle:

- PR validation
- backend unit/integration tests
- dependency vulnerability checks
- Docker image build and push on merge to `main`
- staging deployment flow
- manual approval gate for production
- notification hook for failure scenarios

The production deployment uses AWS Systems Manager to run the versioned image deployment script on the EC2 instance after the production environment approval. Configure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as GitHub environment secrets, with permission to discover the tagged EC2 instance and run SSM commands.

The pipeline also scans both published images with Trivy and fails on unfixed high or critical vulnerabilities.

This is structured as a practical starting point for a real delivery pipeline.

## Monitoring and logging

### Included

- Prometheus scrape configuration in `monitoring/prometheus.yml`
- Application dashboard in `monitoring/grafana-dashboard.json`
- Infrastructure and logs dashboard in `monitoring/infrastructure-dashboard.json`
- Loki/Promtail setup for centralized log collection
- Node exporter and Postgres exporter integration in Docker Compose

Import both JSON files in Grafana from **Dashboards -> New -> Import**. Select the configured Prometheus data source for the application and infrastructure panels, and the Loki data source for the logs panel. Prometheus and Loki are available locally at `http://localhost:9090` and `http://localhost:3100`.

### Operational intent

The goal is to make the stack easy to observe from a production perspective by tracking:

- request rate and latency
- database health and connection activity
- infrastructure metrics like CPU and memory
- central log collection for app and system logs

RDS automated backups are enabled with one-day retention and a scheduled backup window to remain compatible with the current AWS Free Tier account. A paid account or production environment should increase retention to at least seven days. The script in `scripts/backup.sh` creates a portable PostgreSQL custom-format dump and can upload it to an S3 prefix when `S3_BACKUP_URI` is set. Restore testing should be performed against a temporary database before deleting it.

## Security and good practices

### Secret management

- Use GitHub Action secrets for CI/CD credentials
- Store database and cloud secrets in AWS Secrets Manager or Parameter Store
- Never commit `.env` files to source control

### Backup strategy

- RDS snapshots for PostgreSQL
- encrypted S3-based backup archival
- retention policies for daily and weekly backups
- restore testing as part of operations discipline

### Cost control

- keep dev and staging workloads on the smallest viable instance types
- enable multi-AZ only where required by the environment
- shut down non-production infrastructure outside business hours
- manage logs and snapshots with lifecycle policies

## Approach and rationale

The implementation follows a practical sequence that matches how I would normally approach a new assignment:

1. Build the app and validate core behavior first.
2. Add the database and deployment dependencies around it.
3. Extend the environment with Docker, Terraform, and CI/CD.
4. Add observability and operational controls.
5. Document security, cost, and challenge handling clearly.

This keeps the project understandable while still demonstrating breadth across the assignment requirements.

## Challenges faced and resolutions

A few issues came up during implementation, and they were handled in a straightforward way:

- Host environment did not initially have Node/npm installed, which was resolved by installing Node 20 and validating the project on the host machine.
- One dependency version was invalid, which prevented the project from installing correctly until it was corrected.
- The assignment had to balance a demo-ready app with production-grade patterns, so the project was kept simple while still covering infrastructure, delivery, monitoring, and documentation.

The challenge notes are documented in [docs/challenges.md](docs/challenges.md).

## Deliverables

This repository includes:

- running application code
- infrastructure-as-code for AWS resources
- CI/CD automation setup
- monitoring and logging configuration
- documentation covering approach, security, and operational decisions

## Final note

This was built as a practical, assignment-focused implementation and is structured to demonstrate end-to-end ownership across application, infrastructure, and delivery. It still leaves room for production hardening in a real cloud environment, which is expected for a project of this scope.
