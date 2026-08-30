# Secret management guidance

Use a managed secret store instead of committing credentials into source control.

## Recommended options

- GitHub Actions secrets for CI/CD credentials
- AWS Secrets Manager for application and database credentials
- AWS Systems Manager Parameter Store for non-secret configuration

## Example pattern

- `DB_USERNAME` stored in Secrets Manager
- `DB_PASSWORD` stored in Secrets Manager
- `DOCKER_USERNAME` and `DOCKER_PASSWORD` injected into GitHub Actions

## Rules

- Never store `.env` files in the repository
- Rotate credentials regularly
- Restrict access using IAM roles and least-privilege policies
