import { Clickable, Readable, ComponentModel } from './componentmodel';
import { Page } from '@playwright/test';
import { config } from '../config';

export class AccessSecretDisplay extends ComponentModel {
  readonly baseTestId = 'access-secret-display';

  public constructor(protected page: Page) {
    super(page);
  }

  public static async open(page: Page, id: string) {
    await page.goto(`${config.appUrl}/secret/${id}/access`);
    return new AccessSecretDisplay(page);
  }

  get secretContent() {
    return new Readable(AccessSecretDisplay, this.page, 'secret-content');
  }

  get copySecret() {
    return new Clickable(AccessSecretDisplay, this.page, 'copy-secret-button');
  }
}
