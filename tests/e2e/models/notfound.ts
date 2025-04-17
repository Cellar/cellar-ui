import { Clickable, Readable, ComponentModel } from './componentmodel';
import { Page } from '@playwright/test';
import { config } from '../config';

export class NotFound extends ComponentModel {
  readonly baseTestId = 'not-found';

  public constructor(protected page: Page) {
    super(page);
  }

  public static async open(page: Page) {
    await page.goto(`${config.appUrl}/404`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    return new NotFound(page);
  }

  public static async openWithInvalidId(page: Page, invalidId: string) {
    await page.goto(`${config.appUrl}/secret/${invalidId}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(500);
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
