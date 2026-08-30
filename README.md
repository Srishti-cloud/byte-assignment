# 8Byte AI Assignment

This project is a small but complete assignment setup covering the core parts of a production-style application: app development, infrastructure provisioning, deployment automation, observability, and operational documentation. The goal was to build a working baseline that is easy to run locally and can be extended to a real cloud deployment without reworking the project structure.

## Architecture summary

- Frontend: static application served through NGINX
- Backend: Node.js + Express REST API
- Database: PostgreSQL, with a fallback path for local/demo usage
- Infrastructure: Terraform for AWS-based infrastructure, with separate production and staging EC2 instances
- CI/CD: GitHub Actions pipeline for pull requests, image builds, Trivy scans, staging deployment, and a production approval gate
- Monitoring: Prometheus and Grafana, with Loki/Promtail for log collection

The AWS deployment uses an Application Load Balancer in front of the production EC2 instance. The root path is served by the frontend NGINX container; `/api/*` and `/health` are routed directly to the backend container. Both application containers share a Docker network on EC2.

## Repository structure

- `backend/` – API service and tests
- `frontend/` – frontend UI
- `terraform/` – AWS infrastructure definitions
- `monitoring/` – Prometheus, Grafana, Loki, and Promtail config
- `.github/workflows/` – CI/CD workflow definitions
- `docs/` – approach and challenge notes
- `scripts/` – backup and secret-management utilities

## Local setup

### Prerequisites

- Docker and Docker Compose
- Node.js 20+

### Run the full stack locally

```bash
docker compose up --build
```

This starts the application stack and exposes the following endpoints:

- Frontend: http://localhost
- Backend health check: http://localhost:4000/health
- Items API: http://localhost:4000/api/items
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- Loki: http://localhost:3100
- Node exporter: http://localhost:9100/metrics
- PostgreSQL exporter: http://localhost:9187/metrics

Grafana's default local login is `admin` / `admin`. Prometheus and Loki are intended to remain local-only in this assignment deployment.

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

Terraform prompts for the Docker Hub password or access token because EC2 bootstrap logs in to pull the private images. Do not commit this value. The AWS account must have an existing EC2 key pair named `byte-assignment-key`.

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

The pipeline follows this sequence on pushes to `main`:

1. Run backend tests and `npm audit`.
2. Build and push commit-tagged backend and frontend images to Docker Hub.
3. Scan both images with Trivy and fail on unfixed `HIGH` or `CRITICAL` findings.
4. Deploy the commit images to the staging EC2 instance through AWS Systems Manager and run a health check.
5. Wait for the production environment approval.
6. Deploy the same commit images to production through AWS Systems Manager.

Configure these GitHub Actions secrets in the repository or appropriate environment:

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

The AWS identity needs permission to discover the tagged EC2 instances and send and read SSM commands. EC2 receives the `AmazonSSMManagedInstanceCore` policy through its Terraform-managed instance profile, so deployments do not require an SSH private key.

This is structured as a practical starting point for a real delivery pipeline.

## Monitoring and logging

### Included

- Prometheus scrape configuration in `monitoring/prometheus.yml`
- Application dashboard in `monitoring/grafana-dashboard.json`
- Infrastructure and logs dashboard in `monitoring/infrastructure-dashboard.json`
- Loki/Promtail setup for centralized log collection
- Node exporter and Postgres exporter integration in Docker Compose

Import both JSON files in Grafana from **Dashboards -> New -> Import**. Select the configured Prometheus data source for the application and infrastructure panels, and the Loki data source for the logs panel. Prometheus and Loki are available locally at `http://localhost:9090` and `http://localhost:3100`.

The application dashboard covers request rate, error rate, latency, and database connections. The infrastructure dashboard covers CPU, memory, disk, PostgreSQL exporter health, and system logs.

### Operational intent

The goal is to make the stack easy to observe from a production perspective by tracking:

- request rate and latency
- database health and connection activity
- infrastructure metrics like CPU and memory
- central log collection for app and system logs

RDS automated backups are enabled with one-day retention and a scheduled backup window to remain compatible with the current AWS Free Tier account. A paid account or production environment should increase retention to at least seven days. The script in `scripts/backup.sh` creates a portable PostgreSQL custom-format dump and can upload it to an S3 prefix when `S3_BACKUP_URI` is set:

```bash
DATABASE_URL='postgres://user:password@host:5432/database' \
BACKUP_DIR=/tmp/byte-backups \
S3_BACKUP_URI=s3://bucket/byteapp \
./scripts/backup.sh
```

Restore testing should be performed against a temporary database before deleting it.

## Security and good practices

### Secret management

- Use GitHub Action secrets for CI/CD credentials
- Store database and cloud secrets in AWS Secrets Manager or Parameter Store
- Never commit `.env` files to source control
- Replace the example Terraform database password before a real production deployment

### Backup strategy

- RDS automated backups for PostgreSQL with one-day Free Tier-compatible retention
- encrypted S3 upload support for portable dumps through `S3_BACKUP_URI`
- increase retention to at least seven days in a paid production account
- perform restore testing against a temporary database

### Cost control

- keep dev and staging workloads on the smallest viable instance types
- enable multi-AZ only where required by the environment
- shut down non-production infrastructure outside business hours
- manage logs and snapshots with lifecycle policies

The separate staging EC2 instance and production database can incur charges outside AWS Free Tier allowances. Destroy non-production resources when the assignment demonstration is complete.

## Demonstration URLs

### AWS production

- Frontend: http://byte-assignment-alb-609040057.us-east-1.elb.amazonaws.com
- Backend health: http://byte-assignment-alb-609040057.us-east-1.elb.amazonaws.com/health
- Items API: http://byte-assignment-alb-609040057.us-east-1.elb.amazonaws.com/api/items

### Local monitoring

- Prometheus: http://localhost:9090
- Prometheus targets: http://localhost:9090/targets
- Grafana: http://localhost:3001
- Loki: http://localhost:3100

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

This was built as a practical, assignment-focused implementation and is structured to demonstrate end-to-end ownership across application, infrastructure, delivery, observability, and operations. The AWS demo uses HTTP rather than HTTPS, and the current Free Tier account limits RDS automated backup retention to one day; both limitations are documented above.
