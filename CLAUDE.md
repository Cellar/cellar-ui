# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `make build`
- Dev server: `npm run dev` (runs as daemon, use timeout=0 or Ctrl+C to stop)
- Format code: `make format`
- Unit tests: `make test-unit`
- Single test: `npx vitest {path-to-test-file}`
- E2E tests: `make test-e2e`
- E2E specific browser: `make test-e2e E2E_PARAMS="--project=figma"`
- Watch tests: `make test-watch`
- All tests: `make test`
- Start dependencies: `make services`
- Stop dependencies: `make clean-services`

## Docker Testing
- Initialize services and Playwright: `make services`
  - This sets up Redis, Vault, API, and a Playwright container
  - Installs all dependencies and browsers in the Playwright container
- Run tests against initialized services:
  - WebKit tests: `make test-webkit-docker`
  - Specific browser: `make test-e2e-docker-browser BROWSER=chromium-desktop`
  - Custom parameters: `make test-e2e-docker BROWSER=firefox-desktop`
- These commands efficiently:
  - Use the already-configured Playwright container
  - Let Playwright automatically start and manage the UI server
  - Run tests directly against the containerized environment

## GitLab Interaction
- Use `glab` CLI tool (not gh) for GitLab operations
- List pipelines: `glab pipeline list -R cellar-app/cellar-ui`
- List recent commits: `git log -n 3 --oneline`
- Common operations:
  - View pipelines: `glab ci list -R cellar-app/cellar-ui`
  - Filter by status: `glab ci list --status=failed -R cellar-app/cellar-ui`
  - Filter by branch: `glab ci list --ref=react -R cellar-app/cellar-ui`
- WebKit Tests in CI:
  - WebKit tests require additional system dependencies
  - Use `--no-sandbox` and `--disable-gpu` flags for WebKit
  - Reduce parallel workers in CI for better stability
  - Add retry logic for WebKit test failures

## Available E2E Browser Configs
- Desktop: `chromium-desktop`, `firefox-desktop`, `webkit-desktop`
- Mobile Chrome: `chromium-mobile`, `chromium-mobile-landscape`, `chromium-mobile-old`, `chromium-mobile-old-landscape`
- Mobile Safari: `webkit-mobile`, `webkit-mobile-landscape`, `webkit-mobile-old`, `webkit-mobile-old-landscape`
- Design Specs: `figma`, `figma-mobile`, `figma-mobile-tiny`

## Code Style
- **TypeScript**: Strict mode enabled, use explicit typing
- **Components**: React functional components with hooks
- **Testing**: Unit tests with Vitest, E2E with Playwright
- **Models**: Use interfaces (I prefix) in `/models` directory
- **Naming**: PascalCase for components, camelCase for functions/variables
- **CSS**: CSS modules with componentName.module.css pattern
- **Tests**: Component tests should have matching .spec.model.tsx files
- **Data-testid**: Use for test element selection
- **Path Aliases**: Use @/ for src/ and @tests/ for src/tests/
