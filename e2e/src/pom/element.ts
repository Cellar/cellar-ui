import {by, element, ElementFinder} from 'protractor';

export class Element<T> {
  readonly elem: ElementFinder;
  readonly type: new() => T;

  constructor(locator: string, type: (new () => T)) {
    this.type = type;
    this.elem = element(by.css(locator));
  }

  public async click(): Promise<T> {
    await this.elem.click();
    return new this.type();
  }

  public async getText(): Promise<string> {
    return this.elem.getText();
  }

  protected delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}

