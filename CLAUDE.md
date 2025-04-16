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
  - Specific test file: `make test-specific-docker BROWSER=webkit-desktop TEST=tests/e2e/secretMetadata.spec.ts`
  - Custom parameters: `make test-e2e-docker BROWSER=firefox-desktop`
- These commands efficiently:
  - Use the already-configured Playwright container
  - Let Playwright automatically start and manage the UI server
  - Run tests directly against the containerized environment
- WebKit Tests in Docker & CI:
  - WebKit in Docker has strict security restrictions for cross-origin requests that Chrome/Firefox don't have
  - To handle this, we use the Strategy Pattern with browser-specific API clients:
    1. Define an interface (tests/helpers/api/iapiclient.ts):
       ```ts
       export interface IApiClient {
         createSecret(content: string, expirationUtc: Date | number, accessLimit: number): Promise<ISecretMetadata | IApiError>;
         getSecretMetadata(secretId: string): Promise<ISecretMetadata | IApiError>;
         accessSecret(secretId: string): Promise<ISecret | IApiError>;
         deleteSecret(secretId: string): Promise<null | IApiError>;
       }
       
       // Factory function to get the appropriate client
       export function getApiClient(browserName?: string): IApiClient {
         if (browserName === 'webkit') {
           return new WebkitApiClient();
         }
         return new StandardApiClient();
       }
       ```
       
    2. Implement two strategies:
       - StandardApiClient: Uses fetch() API (works in Chrome/Firefox)
       - WebkitApiClient: Uses Playwright's request API (works in WebKit)
       
    3. Create a facade (tests/helpers/api/client.ts) that delegates to the appropriate implementation:
       ```ts
       let currentClient = getApiClient();
       let browserType: string | null = null;
       
       export const setBrowserType = (type: string) => {
         browserType = type;
         currentClient = getApiClient(type);
       };
       
       export const setPlaywrightRequest = (request: APIRequestContext) => {
         if (browserType === 'webkit' && currentClient instanceof WebkitApiClient) {
           (currentClient as WebkitApiClient).setRequest(request);
         }
       };
       
       // API methods that delegate to the current client
       export const createSecret = async (...) => currentClient.createSecret(...);
       // ...and other methods
       ```
       
    4. Create custom Playwright fixtures for browser-agnostic tests:
       ```ts
       // In fixtures/apiFixture.ts
       export interface ApiFixtures {
         initApi: void;
         verifySecretAccess: (secretId: string, expectedCount: number, expectedLimit?: number) => Promise<void>;
       }
       
       export const test = base.extend<ApiFixtures>({
         // Initialize the appropriate API client based on browser
         initApi: async ({ page, request }, use) => {
           const browserName = page.context().browser()?.browserType().name();
           if (browserName) {
             setBrowserType(browserName);
             if (browserName === 'webkit') {
               setPlaywrightRequest(request);
             }
           }
           await use();
         },
         
         // Custom fixture for verifying secret access in a browser-agnostic way
         verifySecretAccess: async ({ page, request }, use) => {
           const verifyFn = async (secretId: string, expectedCount: number, expectedLimit?: number) => {
             // Use the Playwright request context directly (works in all browsers)
             const metadata = await request.get(`${page.url().split('/secret/')[0]}/api/v1/secrets/${secretId}`);
             
             // Handle special cases like access limits being reached (404 response)
             if (expectedCount > 0 && expectedLimit && expectedCount >= expectedLimit) {
               expect(metadata.status()).toBe(404);
               return;
             }
             
             // Normal verification
             expect(metadata.ok()).toBeTruthy();
             const data = (await metadata.json()) as ISecretMetadata;
             expect(data.access_count).toBe(expectedCount);
             if (expectedLimit !== undefined) {
               expect(data.access_limit).toBe(expectedLimit);
             }
           };
           await use(verifyFn);
         },
       });
       ```
       
    5. Update tests to handle both UI and API verification:
       ```ts
       test('starts at 0 value', async ({ page, verifySecretAccess, browserName }) => {
         // Load the page (for all browsers)
         const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
         
         // For non-WebKit browsers, verify through UI
         if (browserName !== 'webkit') {
           const notFound = new NotFound(page);
           expect(await notFound.displayed()).toBe(false, 'Secret page was not found');
           expect(display.accessCount.baseElement).toContainText('0 of');
         }
         
         // For all browsers, verify through API (common verification)
         await verifySecretAccess(secretMetadata.id, 0, startingAccessCount);
       });
       ```
  
  - Other WebKit-specific configurations:
    - Use longer timeouts for WebKit tests: 
      ```ts
      use: { 
        ...devices['Desktop Safari'],
        launchOptions: { timeout: process.env.CI ? 60000 : 30000 },
        navigationTimeout: 30000,
        actionTimeout: 15000,
      }
      ```
    - Add specific wait states for WebKit navigation: `waitForLoadState('networkidle')`
    - Add retry logic for WebKit test failures (retries: 3)
    - Reduce parallel workers in CI for better stability
    - Add CSS ID selectors as fallbacks for test-id selectors
    - Handle 204 responses carefully in WebKit (check text content before JSON parsing)

## GitLab Interaction
- Use `glab` CLI tool (not gh) for GitLab operations
- List pipelines: `glab pipeline list -R cellar-app/cellar-ui`
- List recent commits: `git log -n 3 --oneline`
- Common operations:
  - View pipelines: `glab ci list -R cellar-app/cellar-ui`
  - Filter by status: `glab ci list --status=failed -R cellar-app/cellar-ui`
  - Filter by branch: `glab ci list --ref=react -R cellar-app/cellar-ui`

## Available E2E Browser Configs
- Desktop: `chromium-desktop`, `firefox-desktop`, `webkit-desktop`
- Mobile Chrome: `chromium-mobile`, `chromium-mobile-landscape`, `chromium-mobile-old`, `chromium-mobile-old-landscape`
- Mobile Safari: `webkit-mobile`, `webkit-mobile-landscape`, `webkit-mobile-old`, `webkit-mobile-old-landscape`
- Design Specs: `figma`, `figma-mobile`, `figma-mobile-tiny`

## Application Overview
The web application has three main pages for secret management:

1. **Create Secret Page**:
   - Allows users to create a new secret with configurable options
   - Features a textarea for entering the secret content
   - Provides two expiration modes:
     - Relative: Set time period after which secret expires (default 24 hours)
     - Absolute: Set specific date/time for expiration
   - Includes access limit configuration:
     - Numeric input to set how many times the secret can be accessed
     - Default access limit is 1
     - "No Limit" toggle option for unlimited access
   - Validates inputs (secret content, expiration at least 30 minutes in future)
   - Creates secret via API call and redirects to metadata page

2. **Secret Metadata Page**:
   - Displays information about the secret without revealing content
   - Shows expiration date/time and access count (with limit if set)
   - Displays the secret ID
   - Provides buttons to copy links to both the secret and metadata page
   - Includes delete button for permanent removal
   - Responsive design for mobile/desktop

3. **Access Secret Page**:
   - Displays the actual secret content
   - Simple interface with the secret in a readonly textarea
   - Provides "Copy Secret" button for easy copying
   - Each access increments the access count on the metadata page
   - When access limit is reached, redirects to a "Not Found" page

## E2E Testing Process

When asked to work with E2E tests, follow these step-by-step instructions. You can request specific phases to be completed:
- `"Identify e2e tests for <component>"` - Complete only phase 1
- `"Update models for e2e tests for <component>"` - Complete phases 1-2
- `"Implement e2e tests for <component>"` - Complete all phases 1-3

### Phase 1: Test Identification

1. First, examine the existing tests for the component to understand the current coverage
   - Look in `tests/e2e/*.spec.ts` files related to the component
   - Review component model files in `tests/e2e/models/` directory

2. Identify component functionality by examining:
   - The component source code
   - Any related page components
   - API integrations and data models it uses

3. Create a hierarchical test structure in this format:
   ```
   When <condition/context>
   - it should <expected behavior>
   - it should <expected behavior>
   
       and <additional condition>
       - it should <expected behavior>
       
           and <further nested condition>
           - it should <expected behavior>
   ```

4. Each "When" or "and" statement maps to a potential `test.describe` block
5. Each "it should" statement maps to a potential `test` function
6. Structure tests by user interaction flows and feature conditions
7. Include tests for:
   - Basic component rendering and functionality
   - Component state variations (e.g., with/without data)
   - User interactions (clicks, form inputs)
   - Error states and edge cases
   - Responsive behavior (desktop/mobile differences)
   - Integration with API/backend services

8. Present the complete test hierarchy for review before implementation

### Phase 2: Model Enhancement

1. Ensure component models follow these principles:
   - Models match the actual component implementation hierarchy
   - All UI elements accessed via getter methods returning typed objects
   - Helper methods for common interactions (e.g., `deleteWithConfirmation()`)
   - Models return other models when actions cause page transitions
   - Built-in waiting and visibility checks for all interactions

2. Component Model Implementation Guidelines:
   - Extend appropriate base classes (ComponentModel, etc.)
   - Implement getters for all UI elements needed by tests
   - Use proper typing for all element interactions
   - Add helper methods for complex interactions
   - Ensure automatic waiting for all element interactions
   - Return appropriate model instances from actions (same model or new page)

3. Required Base Functionality:
   - Automatic waiting before interactions (30 second default timeout)
   - Methods to check visibility/existence
   - Page transition handling
   - Error state detection

4. Present model updates separately for review before implementation

### Phase 3: Test Implementation

1. Follow these practices for test implementation:
   - All page interactions should be encapsulated in component models
   - Tests should never directly use `page.locator()`, `page.getBy...()`, or raw selectors
   - Tests should only receive `page` to pass to models, not interact with it directly
   - No explicit waits in test code; all waiting handled by models
   - Clear separation between test logic and page interaction details

2. Implement tests following the identified hierarchy:
   - Create `test.describe` blocks for each "When" and "and" condition
   - Create `test` functions for each "it should" assertion
   - Handle WebKit-specific limitations with browser detection
   - Use API verification as fallback for all browsers

3. Key implementation patterns:
   - Use model-returned models for page transitions
   - Check instance types for page redirects (e.g., `expect(result instanceof NotFound).toBe(true)`)
   - Avoid raw Playwright API calls in test files
   - Keep test code focused on assertions, not interaction details

4. Present test implementation for review

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
- **Comments**: NEVER add comments unless specifically requested
- **After Code Changes**: Always run `make format` after making code changes to ensure consistent formatting
