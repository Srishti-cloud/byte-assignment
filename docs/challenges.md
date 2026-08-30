# Challenges faced and resolutions

## 1. Environment setup was missing at the start

The main blocker at the beginning was that the host machine did not have Node and npm installed. That prevented any local validation from running. I resolved this by installing Node 20 and running the project’s actual test suite on the host machine to confirm the app was working in the same environment that the assignment would be reviewed from.

## 2. Dependency mismatch blocked installation

One of the dependency versions in the project was invalid and prevented `npm install` from completing. This was resolved by correcting the version to a valid published package version and re-running the installation and tests. It was a good reminder that environment stability matters as much as business logic in a project like this.

## 3. The project needed to be kept realistic without becoming too heavy

The assignment asks for a broad set of capabilities, but it is still meant to be manageable. The solution was to keep the app simple and focused on the happy path while still covering infrastructure, deployment, monitoring, and documentation in a practical way.

## 4. Operational requirements are easy to overlook

A lot of assignment projects stop at the application layer, but this one also needed monitoring, staging flow, logging, and operational thinking. The project was extended with Docker Compose monitoring services, Prometheus targets, and log collection so it reflects a more production-like setup rather than a pure demo app.
