# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0] - 2026-01-13

### Added

- Comprehensive rate limiting error handling for API v3.4.0+ (429 status codes)
- RateLimitError component displaying countdown timer and retry button for rate limit errors
- RateLimitWarning component showing proactive warnings at 80% and 95% usage thresholds
- Clock and Warning SVG icon components matching existing app design
- Automatic retry logic with exponential backoff (max 3 retries) for all API calls
- Rate limit metadata extraction from API response headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After)
- Type guards for runtime type checking of API and rate limit errors (isApiError, isRateLimitError, hasRateLimitInfo)
- HTTP response helpers for parsing rate limit headers and calculating retry delays
- IRateLimitInfo interface for structured rate limit metadata
- ApiErrorBoundary component for centralized error routing (created but not yet integrated)
- Comprehensive unit test coverage for rate limiting functionality (81 tests for API client, 26 tests for helpers, 33 tests for error model)

### Changed

- Updated to require cellar-api v3.4.1 or higher (was v3.3.1)
- Extended IApiError interface with optional retryAfter and rateLimit fields
- API client methods now automatically retry on 429 errors with respect to Retry-After header
- CreateSecretForm now displays rate limit errors and warnings instead of silently failing
- Rate limit information now attached to all successful API responses when available
- API retry delays use exponential backoff with jitter (1s, 2s, 4s, 8s with max 10s)
- Page loaders (AccessSecret, SecretMetadata) now throw errors for React Router error boundary handling

### Fixed

- React Router error boundary now properly catches API errors and redirects to NotFound page
- 404 and other API errors now properly handled in loaders instead of being swallowed

## [3.0.1] - 2025-12-27

### Fixed

- File size display now shows appropriate units (Bytes, KB, MB, GB) based on file size instead of always showing MB
- Small files (< 0.1 MB) now display in more readable units (e.g., "500 Bytes" or "15.2 KB" instead of "0.00 MB")
- File size formatting now consistent between create and access pages using formatFileSize helper

## [3.0.0] - 2025-12-26

### Added

- File upload support for creating file secrets
- ContentTypeToggle component for switching between text and file input modes
- FileUploadZone component with drag-and-drop file selection
- SecretInputFile component with file validation (size limits, empty file detection)
- SecretInputText component extracted from CreateSecretForm for better organization
- File secret display with file information card (filename, size in MB)
- Download functionality for file secrets via "Save File" button
- File upload validation error messages with ErrorWrapper integration
- File size display formatted to 2 decimal points in MB
- Comprehensive unit test coverage for file upload and download functionality (21 new tests)
- Integration with cellar-api v3.3.0 filename storage and retrieval

### Changed

- Migrated API client from v1 to v2 endpoints using FormData for multipart requests
- Updated to require cellar-api v3.3.0 or higher (was v1.0.0)
- API client now handles both JSON (text secrets) and binary (file secrets) responses
- CreateSecretForm refactored to use extracted SecretInputText and SecretInputFile components
- File state management moved into SecretInputFile component
- AccessSecretDisplay now conditionally renders based on content type (text vs file)
- Unified styling for text and file inputs on create secret form
- Content-Disposition header parsing for filename extraction with fallback pattern
- API_VERSION in CI pipeline updated from 1.0.0 to 3.3.0

### Security

- Filename sanitization handled by cellar-api to prevent path traversal attacks
- File size limits enforced (default 8 MB maximum)
- Empty file uploads rejected with validation error

## [2.0.0] - 2025-12-23

### Added

- Complete React rewrite of the Cellar UI application
- React Router DOM for navigation and routing
- Mantine UI component library integration (@mantine/core, @mantine/dates, @mantine/form, @mantine/hooks)
- Comprehensive unit testing framework with Vitest and React Testing Library
- End-to-end testing framework with Playwright
  - Multiple browser configurations (Chromium, Firefox, WebKit)
  - Mobile and desktop viewport testing
  - Component model-based test architecture
  - Docker-based E2E testing environment
  - WebKit-compatible API client using Strategy Pattern
  - Custom Playwright fixtures for browser-agnostic testing
- ESLint and Prettier for code quality and formatting
- Copy button component with animated checkmark feedback
- Error wrapper component for consistent form validation display
- "No Limit" toggle option for access limits
- Expiration mode toggle between relative and absolute time
- Labels for create page form inputs
- Favicon and page title
- Footer with "About Cellar" link
- UI version display in footer using build-time static injection via Vite's define configuration
- Date formatting with user localization support
- Path aliases (@/ for src/, @tests/ for tests/)
- Makefile targets for testing, formatting, and service management
- GitLab CI/CD pipeline integration with test reporting
- Docker Compose configuration for local development services (Redis, Vault, API)
- nginx configuration with JSON logging for Loki/Grafana integration
- Contributing documentation, issue templates, and Code of Conduct
- CLAUDE.md documentation for AI-assisted development

### Changed

- Complete UI redesign based on Figma specifications
- Migrated from Angular to React 19
- Updated to Node.js 24 and latest dependency versions
- Updated all major dependencies to latest versions with breaking changes
- Upgraded Playwright Docker image to v1.57.0
- Primary button with expandable text animation
- Copy button timeout reduced to 3 seconds
- Responsive design for mobile, tablet, and desktop viewports
- Tiny mobile width adjusted to 393px (matching Figma design)
- Access limit inputs now disabled when "No Limit" is toggled
- Form validation now uses error wrapper component instead of disabled buttons
- Metadata page no longer shows access limit when set to unlimited
- Component organization into subdirectories for better structure
- License year updated to 2025
- Copyright information updated
- Dev email updated in Code of Conduct

### Fixed

- Bug where relative expiration values would reload on re-render
- Bug where absolute expiration values would reload on re-render
- Typo in expiration modes
- Width of textarea and round button alignment
- Color of textarea focus border
- Lock icon in new secret button
- Link on not found page
- Footer blocking buttons on 404 page
- Indent of error messages on create page
- Centering of buttons on create page
- Height of textarea on create page with new line height
- Padding issues across all pages for mobile and desktop
- Formatting issues on create, metadata, access, and error pages
- E2E test stability in Docker environment
- WebKit-specific test failures in CI
- Mobile Chrome and landscape mode test stability
- Header style bugs
- Docker build issues
- Audit warnings without breaking changes

### Removed

- Angular application and all Angular dependencies
- Deprecated Docker stable tag in favor of latest

## [1.0.0] - 2022-04-18

### Added

- Initial open source release of Cellar UI
- Angular-based web application
- Secret creation with configurable expiration and access limits
- Secret metadata viewing
- Secret access and retrieval
- Secret deletion functionality
- Docker containerization
- GitLab CI/CD pipeline
- Makefile for development workflows

[Unreleased]: https://gitlab.com/cellar-app/cellar-ui/compare/v3.1.0...HEAD
[3.1.0]: https://gitlab.com/cellar-app/cellar-ui/compare/v3.0.1...v3.1.0
[3.0.1]: https://gitlab.com/cellar-app/cellar-ui/compare/v3.0.0...v3.0.1
[3.0.0]: https://gitlab.com/cellar-app/cellar-ui/compare/v2.0.0...v3.0.0
[2.0.0]: https://gitlab.com/cellar-app/cellar-ui/compare/v1.0.0...v2.0.0
[1.0.0]: https://gitlab.com/cellar-app/cellar-ui/releases/tag/v1.0.0
