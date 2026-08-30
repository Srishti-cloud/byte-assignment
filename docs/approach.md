# Approach and Assignment Notes

The main goal of this assignment was not to build complex business logic, but to show that I can take a small working application and turn it into something that looks and behaves like a production-ready system from an infrastructure and delivery perspective.

I started with the happy path: a minimal but functioning API, basic validation, and a simple frontend flow. Once that was in place, I added the parts that make a project realistic from an engineering standpoint: Docker, Terraform, CI/CD, observability, and documentation for operations and security.

## Why this approach was useful

This order matters because it keeps the project understandable and testable. A clean app foundation is easier to validate, and once the application behavior is stable, it becomes much easier to add the deployment and operational layers around it.

## Architectural decisions

- Node.js + Express was chosen because it is lightweight, familiar, and easy to run in containers.
- PostgreSQL was included to reflect the expected production pattern, even in a demo-focused assignment.
- Terraform was used to model the AWS platform resources in an infrastructure-as-code format.
- A separate staging EC2 instance was added so image deployments are validated independently before production approval.
- GitHub Actions was used for CI/CD because it is simple to reason about and realistic for a coding assignment.
- AWS Systems Manager was selected for production deployment so GitHub Actions can update EC2 without storing an SSH private key.
- Trivy was added to scan the exact Docker images published by the pipeline before deployment.
- Prometheus and Grafana were used to provide a clear monitoring baseline, while Loki/Promtail was added for log collection.

## Security and operations thinking

The assignment is not only about building features; it also expects the candidate to think about how the system will run in the real world. That is why the project includes a few practical standards:

- secrets are expected to live outside the repository
- database access should be limited to the app layer
- public exposure should be minimized to what is strictly required
- dependency and container checks should be part of the delivery process

## Backup and resilience

For a production system, I would use automated snapshots for PostgreSQL and archive them in encrypted storage. A simple backup strategy is enough for a demo project, but it is important to show that the system is designed with operational recovery in mind rather than just feature delivery.

## Challenges encountered

The main challenge was balancing realism with time. It is easy to go too far into either side: either build only a toy app or spend too much time on enterprise architecture without finishing the basics. The project keeps the scope manageable while still showing that the system covers the assignment requirements in a credible way.

## What would come next in a real production rollout

- full PostgreSQL integration into the app layer
- structured logs and metrics instrumentation in the backend
- separate environment management for dev, staging, and prod
- connect the staging job to a separate environment and add a tested restore workflow for backups
- alerting rules and retention policies for logs and backups

This keeps the project honest: it is complete as a thoughtful assignment package, but it is still intentionally designed as a strong starting point rather than a fully production-operated production system.
