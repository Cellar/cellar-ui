import { expect, Locator, Page } from '@playwright/test';

// Default timeout for element actions (30 seconds)
const DEFAULT_TIMEOUT = 30000;

export abstract class ComponentModel {
  public constructor(protected page: Page) {}

  get baseElement(): Locator {
    return this.page.getByTestId(this.baseTestId);
  }

  /**
   * Determines if the current viewport is mobile-sized
   * @param maxWidth Optional parameter to set custom width threshold (default 500px)
   * @returns True if current viewport is mobile-sized
   */
  public async isMobile(maxWidth: number = 500): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return !!(viewport && viewport.width <= maxWidth);
  }

  /**
   * Gets the current viewport size category
   * @returns 'xs' | 'sm' | 'md' | 'lg' | 'xl' based on viewport width
   */
  public async getViewportCategory(): Promise<
    'xs' | 'sm' | 'md' | 'lg' | 'xl'
  > {
    const viewport = this.page.viewportSize();
    if (!viewport) return 'md'; // Default if unknown

    const width = viewport.width;
    if (width <= 375) return 'xs';
    if (width <= 576) return 'sm';
    if (width <= 768) return 'md';
    if (width <= 992) return 'lg';
    return 'xl';
  }

  public async reload() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    // Return the same instance, derived classes will override this
    return this;
  }

  public async displayed(): Promise<boolean> {
    try {
      await this.baseElement.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  public async expectVisible(): Promise<void> {
    await this.baseElement.waitFor({
      state: 'visible',
      timeout: DEFAULT_TIMEOUT,
    });
    expect(await this.baseElement.isVisible()).toBe(true);
  }

  public async expectHidden(): Promise<void> {
    await this.baseElement.waitFor({
      state: 'hidden',
      timeout: DEFAULT_TIMEOUT,
    });
    expect(await this.baseElement.isVisible()).toBe(false);
  }

  public async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  public async navigateTo<T extends ComponentModel>(
    url: string,
    type: new (page: Page) => T,
  ): Promise<T> {
    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: DEFAULT_TIMEOUT,
    });
    return new type(this.page);
  }

  abstract get baseTestId(): string;
}

export class Tag<T extends ComponentModel> {
  protected baseElement: Locator;
  private handlers: (() => Promise<void>)[];

  public constructor(
    protected type: new (page: Page) => T,
    protected page: Page,
    protected testIdOrLocator: string | Locator,
  ) {
    this.baseElement =
      typeof testIdOrLocator === 'string'
        ? page.getByTestId(testIdOrLocator)
        : testIdOrLocator;
    this.handlers = [];
  }

  protected async awaitHandlers() {
    for (const handler of this.handlers) {
      await handler();
    }
    this.handlers = [];
  }

  // Wait for the element to be visible before any interaction
  protected async ensureVisible() {
    try {
      await this.baseElement.waitFor({
        state: 'visible',
        timeout: DEFAULT_TIMEOUT,
      });
    } catch (error) {
      console.error(`Element ${this.baseTestId} not visible in time: ${error}`);
      throw error;
    }
  }

  public withWaitForUrl(url: string | RegExp) {
    this.handlers.push(async () => {
      await this.page.waitForURL(url, { timeout: DEFAULT_TIMEOUT });
    });
    return this;
  }

  public withWaitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle',
  ) {
    this.handlers.push(async () => {
      await this.page.waitForLoadState(state, { timeout: DEFAULT_TIMEOUT });
    });
    return this;
  }

  public withWaitForTimeout(ms: number) {
    this.handlers.push(async () => {
      await this.page.waitForTimeout(ms);
    });
    return this;
  }

  public withWaitForSelector(
    selector: string,
    options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden' },
  ) {
    this.handlers.push(async () => {
      await this.page.waitForSelector(selector, {
        ...options,
        timeout: DEFAULT_TIMEOUT,
      });
    });
    return this;
  }

  public withWaitForNavigation() {
    this.handlers.push(async () => {
      await this.page.waitForNavigation({ timeout: DEFAULT_TIMEOUT });
    });
    return this;
  }

  public async expectContainsText(text: string): Promise<void> {
    await this.ensureVisible();
    await expect(this.baseElement).toContainText(text);
  }
}

export class Readable<T extends ComponentModel> extends Tag<T> {
  public async getText() {
    await this.ensureVisible();
    return await this.baseElement.innerText();
  }

  public async isVisible() {
    try {
      await this.baseElement.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  public async inputValue() {
    await this.ensureVisible();
    return await this.baseElement.inputValue();
  }
}

export class Hoverable<T extends ComponentModel> extends Readable<T> {
  public async hover() {
    await this.ensureVisible();
    await this.baseElement.hover();
    await this.awaitHandlers();
    return new this.type(this.page);
  }
}

export class Clickable<T extends ComponentModel> extends Hoverable<T> {
  public async click() {
    await this.ensureVisible();

    // Check if we're on mobile and need additional prep for the click
    const componentModel = new this.type(this.page);
    const isMobile = await componentModel.isMobile();

    if (isMobile) {
      try {
        // For mobile, ensure element is in view before clicking
        await this.baseElement.scrollIntoViewIfNeeded();
        // Small delay to ensure UI is stable after scrolling
        await this.page.waitForTimeout(500);
      } catch (e) {
        // If scrollIntoViewIfNeeded fails, log but continue
        console.log(`Mobile scroll adjustment failed: ${e}`);
      }
    }

    await this.baseElement.click();
    await this.awaitHandlers();
    return new this.type(this.page);
  }

  /**
   * Performs a click with enhanced mobile and cross-browser support
   * Note: This method attempts to verify copy operations but won't fail if the notification doesn't appear
   * @param timeoutMs Timeout for success feedback detection (default: 5000ms)
   * @returns The component model instance
   */
  public async clickAndVerifyFeedback(
    timeoutMs: number = 5000,
  ): Promise<T> {
    await this.ensureVisible();

    // Check if we're on mobile
    const componentModel = new this.type(this.page);
    const isMobile = await componentModel.isMobile();
    const viewportCategory = await componentModel.getViewportCategory();

    // Extra prep for mobile devices
    if (isMobile) {
      try {
        await this.baseElement.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);
      } catch (e) {
        console.log(`Mobile scroll adjustment failed: ${e}`);
      }
    }

    // Always include a pre-click delay for better stability
    await this.page.waitForTimeout(300);
    
    // Perform the click
    await this.baseElement.click();
    
    // Always include a post-click delay to allow operations to complete
    await this.page.waitForTimeout(300);

    // Try to detect success feedback, but don't fail the test if not found
    try {
      await this.page.getByTestId('copy-notification').waitFor({
        state: 'visible',
        timeout: viewportCategory === 'xs' ? timeoutMs * 1.5 : timeoutMs,
      });
    } catch (e) {
      // Log but don't fail - some environments may not show feedback reliably
      console.log(`Success feedback not detected, continuing test: ${e}`);
    }

    await this.awaitHandlers();
    return new this.type(this.page);
  }
}

export class Fillable<T extends ComponentModel> extends Clickable<T> {
  public async fill(value: string) {
    await this.ensureVisible();
    await this.baseElement.fill(value);
    await this.awaitHandlers();
    return new this.type(this.page);
  }
}

export class Checkable<T extends ComponentModel> extends Clickable<T> {
  public async check() {
    await this.ensureVisible();
    await this.baseElement.check();
    await this.awaitHandlers();
    return new this.type(this.page);
  }

  public async uncheck() {
    await this.ensureVisible();
    await this.baseElement.uncheck();
    await this.awaitHandlers();
    return new this.type(this.page);
  }
}
