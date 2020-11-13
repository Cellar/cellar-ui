import {browser, by, element, ElementFinder} from 'protractor';
import {Label} from '../../../pom/label';

export class SecretMetadataPage {
  title = new Label('#nav-bar span#title', SecretMetadataPage);
  accessCountContent = new Label('#access-count-content', SecretMetadataPage);
  expiration = new Label('#expiration', SecretMetadataPage);

  navigateTo(id: string): Promise<unknown> {
    return browser.get(`${browser.baseUrl}/secret/${id}`) as Promise<unknown>;
  }
}
