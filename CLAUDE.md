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
