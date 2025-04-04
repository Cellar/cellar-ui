import { Locator, Page } from '@playwright/test';

export abstract class ComponentModel {
  protected constructor(protected page: Page) {}

  get baseElement(): Locator {
    return this.page.getByTestId(this.baseTestId);
  }

  private async reload<T extends ComponentModel>(type: new (page: Page) => T) {
    await this.page.reload();
    await this.page.waitForLoadState();
    return new type(this.page);
  }

  private async displayed(): Promise<boolean> {
    return await this.baseElement.isVisible();
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

export class Readable<T extends ComponentModel> extends Tag<T> {
  public async getText() {
    return await this.baseElement.innerText();
  }

  public async isVisible() {
    return await this.baseElement.isVisible();
  }
}

export class Hoverable<T extends ComponentModel> extends Readable<T> {
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

export class Checkable<T extends ComponentModel> extends Clickable<T> {
  public async check() {
    await this.baseElement.check();
    await this.awaitHandlers();
    return new this.type(this.page);
  }

  public async uncheck() {
    await this.baseElement.uncheck();
    await this.awaitHandlers();
    return new this.type(this.page);
  }
}
