import {Expiration, SecretCreatePage} from './secret-create.po';
import {browser, logging} from 'protractor';
import {SecretMetadataPage} from '../secret-metadata/secret-metadata.po';
import {ExpirationMethod, TimeMeasurement} from '../../../../../src/app/secrets/secret-create/expiration';

describe('when creating a secret', () => {
  let createPage: SecretCreatePage;
  let metadataPage: SecretMetadataPage;

  beforeEach(() => {
    createPage = new SecretCreatePage();
    createPage.navigateTo();
  });

  it('should display Title', () => {
    expect(createPage.title.getText()).toEqual('Cellar');
  });

  describe('and using defaults', () => {
    describe('and using relative expiration', () => {
      const millisecondsInAMinute = 1000 * 60;
      const millisecondsInAnHour = millisecondsInAMinute * 60;
      const minExpectedDefaultExpiration = Date.now() + (millisecondsInAnHour * 24) - (millisecondsInAMinute * 2);
      const maxExpectedDefaultExpiration = Date.now() + (millisecondsInAnHour * 24) + (millisecondsInAMinute * 2);

      beforeEach(async () => {
        metadataPage = await createPage.createSecretWithDefaults(
          new Date().toUTCString(),
          ExpirationMethod.Relative,
        );
      });

      it('should have the correct default access count', () => {
        expect(metadataPage.accessCountContent.getText()).toContain('0 of 1');
      });

      it('should have the correct expiration', async () => {
        const expirationText = await metadataPage.expiration.getText();
        const actual = new Date(expirationText);
        // Verify expiration is correct +- a few minutes
        expect(actual).toBeGreaterThan(minExpectedDefaultExpiration);
        expect(actual).toBeLessThan(maxExpectedDefaultExpiration);
      });
    });

    describe('and using absolute expiration', () => {
      let expectedDefaultExpiration: Date;

      beforeEach(async () => {
        expectedDefaultExpiration = new Date();
        expectedDefaultExpiration.setDate(expectedDefaultExpiration.getDate() + 1);
        expectedDefaultExpiration.setHours(0);
        expectedDefaultExpiration.setMinutes(0);
        expectedDefaultExpiration.setSeconds(0);
        expectedDefaultExpiration.setMilliseconds(0);

        metadataPage = await createPage.createSecretWithDefaults(
          new Date().toUTCString(),
          ExpirationMethod.Absolute,
        );
      });

      it('should have the correct default access count', async () => {
        expect(metadataPage.accessCountContent.getText()).toContain('0 of 1');
      });

      it('should have the correct expiration', async () => {
        const expirationText = await metadataPage.expiration.getText();
        const actual = new Date(expirationText);
        expect(actual.getTime()).toBe(expectedDefaultExpiration.getTime());
      });
    });
  });

  describe('and using explicit values', () => {
    describe('and using relative expiration in hours', () => {
      const millisecondsInAMinute = 1000 * 60;
      const millisecondsInAnHour = millisecondsInAMinute * 60;
      const minExpectedDefaultExpiration = Date.now() + (millisecondsInAnHour * 46) - (millisecondsInAMinute * 2);
      const maxExpectedDefaultExpiration = Date.now() + (millisecondsInAnHour * 46) + (millisecondsInAMinute * 2);
      const expectedAccessLimit = 4;

      beforeEach(async () => {
        metadataPage = await createPage.createSecret(
          new Date().toUTCString(),
          Expiration.relative(46, TimeMeasurement.Hours),
          expectedAccessLimit,
        );
      });

      it('should have the correct access count', () => {
        expect(metadataPage.accessCountContent.getText()).toContain(`0 of ${expectedAccessLimit}`);
      });

      it('should have the correct expiration', async () => {
        const expirationText = await metadataPage.expiration.getText();
        const actual = new Date(expirationText);
        // Verify expiration is correct +- a few minutes
        expect(actual).toBeGreaterThan(minExpectedDefaultExpiration);
        expect(actual).toBeLessThan(maxExpectedDefaultExpiration);
      });
    });

    describe('and using relative expiration in minutes', () => {
      const millisecondsInAMinute = 1000 * 60;
      const millisecondsInAnHour = millisecondsInAMinute * 60;
      const minExpectedDefaultExpiration = Date.now() + (millisecondsInAnHour * 44) - (millisecondsInAMinute * 2);
      const maxExpectedDefaultExpiration = Date.now() + (millisecondsInAnHour * 44) + (millisecondsInAMinute * 2);
      const expectedAccessLimit = 4;

      beforeEach(async () => {
        metadataPage = await createPage.createSecret(
          new Date().toUTCString(),
          Expiration.relative(44 * 60, TimeMeasurement.Minutes),
          expectedAccessLimit,
        );
      });

      it('should have the correct access count', () => {
        expect(metadataPage.accessCountContent.getText()).toContain(`0 of ${expectedAccessLimit}`);
      });

      it('should have the correct expiration', async () => {
        const expirationText = await metadataPage.expiration.getText();
        const actual = new Date(expirationText);
        // Verify expiration is correct +- a few minutes
        expect(actual).toBeGreaterThan(minExpectedDefaultExpiration);
        expect(actual).toBeLessThan(maxExpectedDefaultExpiration);
      });
    });

    describe('and using absolute expiration', () => {
      let expectedDefaultExpiration: Date;
      const expectedAccessLimit = 5;

      beforeEach(async () => {
        expectedDefaultExpiration = new Date();
        expectedDefaultExpiration.setDate(expectedDefaultExpiration.getDate() + 3);
        expectedDefaultExpiration.setHours(10);
        expectedDefaultExpiration.setMinutes(30);
        expectedDefaultExpiration.setSeconds(0);
        expectedDefaultExpiration.setMilliseconds(0);

        metadataPage = await createPage.createSecret(
          new Date().toUTCString(),
          Expiration.absolute(expectedDefaultExpiration),
          expectedAccessLimit,
        );
      });

      it('should have the correct default access count', async () => {
        expect(metadataPage.accessCountContent.getText()).toContain(`0 of ${expectedAccessLimit}`);
      });

      it('should have the correct expiration', async () => {
        const expirationText = await metadataPage.expiration.getText();
        const actual = new Date(expirationText);
        expect(actual.getTime()).toBe(expectedDefaultExpiration.getTime());
      });
    });
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
