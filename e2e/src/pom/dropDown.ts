import {by, element, ElementFinder} from 'protractor';
import {Element} from './element';

export class DropDown<T> extends Element<T> {
    readonly optionXpath: string;

    constructor(locator: string, optionXpath: string, type: (new () => T)) {
        super(locator, type);
        this.optionXpath = optionXpath;
    }

    public async select(value: string): Promise<T> {
        await this.click();
        const option = element(by.xpath(`${this.optionXpath}//*[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='${value.toLocaleLowerCase()}']`));
        await option.click();
        return new this.type();
    }
}
