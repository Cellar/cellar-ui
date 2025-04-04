import {
  Clickable,
  Readable,
  ComponentModel,
} from 'tests/e2e/models/componentmodel';
import { Page } from '@playwright/test';
import { config } from 'tests/e2e/config';

export class NotFound extends ComponentModel {
  readonly baseTestId = 'not-found';

  protected constructor(protected page: Page) {
    super(page);
  }

  public static async open(page: Page) {
    await page.goto(`${config.appUrl}/404`);
    return new NotFound(page);
  }

  get header() {
    return new Readable(NotFound, this.page, 'header');
  }

  get message() {
    return new Readable(NotFound, this.page, 'message');
  }

  get cta() {
    return new Readable(NotFound, this.page, 'cta');
  }

  get newSecretButton() {
    return new Clickable(NotFound, this.page, 'new-secret-button');
  }
}
