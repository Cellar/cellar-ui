import { expect, Locator, Page } from '@playwright/test';

// Default timeout for element actions (30 seconds)
const DEFAULT_TIMEOUT = 30000;

export abstract class ComponentModel {
  public constructor(protected page: Page) {}

  get baseElement(): Locator {
    return this.page.getByTestId(this.baseTestId);
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
    await this.baseElement.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
    expect(await this.baseElement.isVisible()).toBe(true);
  }

  public async expectHidden(): Promise<void> {
    await this.baseElement.waitFor({ state: 'hidden', timeout: DEFAULT_TIMEOUT });
    expect(await this.baseElement.isVisible()).toBe(false);
  }

  public async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  public async navigateTo<T extends ComponentModel>(
    url: string, 
    type: new (page: Page) => T
  ): Promise<T> {
    await this.page.goto(url, { waitUntil: 'networkidle', timeout: DEFAULT_TIMEOUT });
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
      await this.baseElement.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
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

  public withWaitForSelector(selector: string, options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden' }) {
    this.handlers.push(async () => {
      await this.page.waitForSelector(selector, { 
        ...options, 
        timeout: DEFAULT_TIMEOUT 
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
    await this.baseElement.click();
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
