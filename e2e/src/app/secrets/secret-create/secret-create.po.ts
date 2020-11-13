import {browser} from 'protractor';
import {SecretMetadataPage} from '../secret-metadata/secret-metadata.po';
import {AMPM, ExpirationMethod, Time, TimeMeasurement} from '../../../../../src/app/secrets/secret-create/expiration';
import {TextInput} from '../../../pom/textInput';
import {DropDown} from '../../../pom/dropDown';
import {Label} from '../../../pom/label';
import {Button} from '../../../pom/button';

export class SecretCreatePage {
  readonly title = new Label('#nav-bar span#title', SecretCreatePage);
  readonly secretContent = new TextInput('#secret-content', SecretCreatePage);
  readonly expirationMethod = new DropDown('#expiration-method', '//*[@id=\'expiration-method-option\']', SecretCreatePage);

  readonly expirationRelativeValue = new TextInput('#expiration-value', SecretCreatePage);
  readonly expirationRelativeMeasurement =
    new DropDown('#expiration-measurement', '//*[@id=\'expiration-measurement-option\']', SecretCreatePage);

  readonly expirationAbsoluteDate =
    new TextInput('#expiration-date', SecretCreatePage);
  readonly expirationAbsoluteTime =
    new DropDown('#expiration-time', '//*[@id=\'expiration-time-option\']', SecretCreatePage);
  readonly expirationAbsoluteAmPm =
    new DropDown('#expiration-ampm', '//*[@id=\'expiration-ampm-option\']', SecretCreatePage);

  readonly accessLimit = new TextInput('#access-limit', SecretCreatePage);
  readonly createButton = new Button('#btn-create', SecretMetadataPage);

  async navigateTo(): Promise<SecretCreatePage> {
    await browser.get(browser.baseUrl);
    return this;
  }

  async createSecretWithDefaults(content: string, expirationMethod: ExpirationMethod) {
    await this.secretContent.set(content);
    await this.expirationMethod.select(expirationMethod);
    return await this.createButton.click();
  }

  async createSecret(content: string, expiration: Expiration, accessLimit?: number): Promise<SecretMetadataPage> {
    await this.secretContent.set(content);
    await this.setExpiration(expiration);
    if (accessLimit != null) {
      await this.accessLimit.set(accessLimit.toString());
    }
    return await this.createButton.click();
  }

  private async setExpiration(expiration: Expiration) {
    await this.expirationMethod.select(expiration.method);
    if (expiration.method === ExpirationMethod.Relative) {
      await this.expirationRelativeValue.set(expiration.value.toString());
      await this.expirationRelativeMeasurement.select(expiration.measurement);
    } else {
      await this.expirationAbsoluteDate.click();
      await this.expirationAbsoluteDate.set(
        `${expiration.date.getMonth() + 1}/${expiration.date.getDate()}/${expiration.date.getFullYear()}`,
        true,
      );
      await this.expirationAbsoluteTime.select(Time.toString(
        expiration.date.getHours(),
        expiration.date.getMinutes(),
      ));
      if (expiration.date.getHours() > 11) {
        await this.expirationAbsoluteAmPm.select(AMPM.PM);
      } else {
        await this.expirationAbsoluteAmPm.select(AMPM.AM);
      }
    }
  }
}

export class Expiration {
  readonly method: ExpirationMethod;
  readonly value: number;
  readonly measurement: TimeMeasurement;

  readonly date: Date;

  public static absolute(date: Date): Expiration{
    return new Expiration(ExpirationMethod.Absolute, null, null, date);
  }

  public static relative(value: number, measurement: TimeMeasurement): Expiration {
    return new Expiration(ExpirationMethod.Relative, value, measurement);
  }

  private constructor(method: ExpirationMethod, value?: number, measurement?: TimeMeasurement, date?: Date) {
    this.method = method;
    this.value = value;
    this.measurement = measurement;
    this.date = date;
  }
}

