You are a backend developer working on a project where CI/CD pipelines need to be implemented. Your task is to study the codebase and create 3 GitHub Actions workflows.

In the **lint-and-format.yml** file:

* Implement a workflow triggered on pushes and pull requests to the `main` and `staging` branches.
* Use Node.js `20.x` with caching enabled.
* Install dependencies with `npm ci`.
* Run ESLint with `npm run lint` and Prettier check with `npm run format:check`.
* Fail the workflow if issues are found, and provide clear annotations suggesting fixes with `npm run lint:fix` and `npm run format`.

In the **tests.yml** file:

* Implement a workflow triggered on pushes and pull requests to the `main` and `staging` branches.
* Use Node.js `20.x` with caching enabled.
* Install dependencies with `npm ci`.
* Run tests with `npm test`, ensuring environment variables like `NODE_ENV=test`, `NODE_OPTIONS=--experimental-vm-modules`, and `DATABASE_URL` are set.
* Upload coverage reports as artifacts for 30 days retention.
* Generate a GitHub step summary showing test results or coverage status.
* Add annotations for test failures if any occur.

In the **docker-build-and-push.yml** file:

* Implement a workflow triggered on pushes to the `main` branch or manually via `workflow_dispatch`.
* Configure Docker Buildx for multi-platform builds.
* Log in to Docker Hub using secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`).
* Use `docker/metadata-action` to extract tags and labels, including branch, commit SHA, `latest`, and a `prod-YYYYMMDD-HHmmss` timestamp format.
* Build and push a production image with `docker/build-push-action`, targeting `linux/amd64` and `linux/arm64`, using caching for efficiency.
* Append a GitHub summary with the published image name and tags.