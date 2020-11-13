import {Element} from './element';
import {protractor} from 'protractor';

export class TextInput<T> extends Element<T> {

  public async append(value: string) {
    await this.sendKeys(value, false);
  }

  public async set(value: string, hotKeyClear = false) {
    await this.sendKeys(value, true, hotKeyClear);
  }

  private async sendKeys(value: string, clear = true, hotKeyClear = false) {
    await this.click();
    if (clear) {
      await this.clear();
    }
    if (hotKeyClear) {
      await this.clear(true);
    }
    await this.elem.sendKeys(value);
  }

  public async clear(hotKeyClear = false) {
    if (hotKeyClear) {
      await this.elem.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      await this.elem.sendKeys(protractor.Key.BACK_SPACE);
    } else {
      await this.elem.clear();
    }
  }
}
