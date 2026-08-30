# GitHub Actions setup notes

This pipeline is designed to:

- run tests for every pull request to main
- build and push container images on merge to main
- deploy to staging automatically
- require a manual approval step before production deployment
- notify on pipeline failure via Slack or email integration

Required repository secrets:

- DOCKER_USERNAME
- DOCKER_PASSWORD
- SLACK_WEBHOOK_URL (optional for notifications)

Use GitHub Environment protection rules for the `production` environment to require approval.
