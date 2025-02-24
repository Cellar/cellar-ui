import { Locator, Page } from '@playwright/test';

export abstract class ComponentModel {
  constructor(protected page: Page) {}

  get baseElement(): Locator {
    return this.page.getByTestId(this.baseTestId);
  }

  abstract get baseTestId(): string;
}

export class Tag<T extends ComponentModel> {
  protected baseElement: Locator;
  private handlers: (() => Promise<void>)[];

  public constructor(
    protected type: new (page: Page) => T,
    protected page: Page,
    protected testId: string,
  ) {
    this.baseElement = page.getByTestId(testId);
    this.handlers = [];
  }

  protected async awaitHandlers() {
    for (const handler of this.handlers) {
      await handler();
    }
    this.handlers = [];
  }

  public withWaitForUrl(url: string | RegExp) {
    this.handlers.push(async () => {
      await this.page.waitForURL(url);
    });
    return this;
  }

  public withWaitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle',
  ) {
    this.handlers.push(async () => {
      await this.page.waitForLoadState(state);
    });
    return this;
  }
}

export class Hoverable<T extends ComponentModel> extends Tag<T> {
  public async hover() {
    await this.baseElement.hover();
    await this.awaitHandlers();
    return new this.type(this.page);
  }
}

export class Clickable<T extends ComponentModel> extends Hoverable<T> {
  public async click() {
    await this.baseElement.click();
    await this.awaitHandlers();
    return new this.type(this.page);
  }
}

export class Fillable<T extends ComponentModel> extends Clickable<T> {
  public async fill(value: string) {
    await this.baseElement.fill(value);
    await this.awaitHandlers();
    return new this.type(this.page);
  }
}
