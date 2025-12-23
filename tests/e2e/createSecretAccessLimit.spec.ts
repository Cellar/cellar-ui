import { test } from './fixtures/apiFixture';
import { expect } from '@playwright/test';
import { CreateSecretForm } from './models/createsecret';
import { SecretMetadataDisplay } from './models/secretmetadata';

/**
 * E2E tests for the Create Secret page - Access Limit Settings
 */
test.describe('when configuring access limit on the create secret page', () => {
  test('it should increment access limit when clicking the + button', async ({
    page,
    browserName,
  }) => {
    // Skip WebKit browsers due to security restrictions
    test.skip(
      browserName === 'webkit',
      'This test is skipped in WebKit due to security restrictions',
    );

    const form = await CreateSecretForm.open(page);

    // Get initial value
    const initialValue = await form.accessLimitInput.baseElement.inputValue();
    const initialNum = parseInt(initialValue, 10);

    // Click the increment button
    await form.incrementAccessLimit();

    // Verify value increased by 1
    const newValue = await form.accessLimitInput.baseElement.inputValue();
    expect(parseInt(newValue, 10)).toBe(initialNum + 1);
  });

  test('it should decrement access limit when clicking the - button', async ({
    page,
    browserName,
  }) => {
    // Skip WebKit browsers due to security restrictions
    test.skip(
      browserName === 'webkit',
      'This test is skipped in WebKit due to security restrictions',
    );

    const form = await CreateSecretForm.open(page);

    // First increment to ensure we're not at minimum
    await form.incrementAccessLimit(2);

    // Get value after increment
    const midValue = await form.accessLimitInput.baseElement.inputValue();
    const midNum = parseInt(midValue, 10);

    // Click the decrement button
    await form.decrementAccessLimit();

    // Verify value decreased by 1
    const newValue = await form.accessLimitInput.baseElement.inputValue();
    expect(parseInt(newValue, 10)).toBe(midNum - 1);
  });

  test('it should not allow decrementing below 1', async ({
    page,
    browserName,
  }) => {
    // Skip WebKit browsers due to security restrictions
    test.skip(
      browserName === 'webkit',
      'This test is skipped in WebKit due to security restrictions',
    );

    const form = await CreateSecretForm.open(page);

    // Set to 1
    await form.setAccessLimit(1);

    // Try to decrement
    await form.decrementAccessLimit();

    // Verify value stays at 1
    const newValue = await form.accessLimitInput.baseElement.inputValue();
    expect(parseInt(newValue, 10)).toBe(1);
  });

  test('it should update value when typing directly in the input', async ({
    page,
    browserName,
  }) => {
    // Skip WebKit browsers due to security restrictions
    test.skip(
      browserName === 'webkit',
      'This test is skipped in WebKit due to security restrictions',
    );

    const form = await CreateSecretForm.open(page);

    // Type a value directly
    const testValue = 5;
    await form.setAccessLimit(testValue);

    // Verify value was updated
    const inputValue = await form.accessLimitInput.baseElement.inputValue();
    expect(parseInt(inputValue, 10)).toBe(testValue);
  });

  test('it should toggle the "No Limit" option', async ({
    page,
    browserName,
  }) => {
    // Skip all browsers until we can resolve the checkbox interaction issues
    test.skip(
      true,
      'This test is temporarily skipped due to toggle interaction issues in Docker environment',
    );

    const form = await CreateSecretForm.open(page);

    // Get initial state
    const checkbox = page.locator(
      '[data-testid="no-limit-toggle"] input[type="checkbox"]',
    );
    const initialChecked = await checkbox.isChecked();
    expect(initialChecked).toBe(false);

    // Toggle the option on
    await form.toggleNoLimit(true);

    // Verify it's checked
    const nowChecked = await checkbox.isChecked();
    expect(nowChecked).toBe(true);
  });

  test('it should disable the number input when "No Limit" is selected', async ({
    page,
    browserName,
  }) => {
    // Skip all browsers until we can resolve the checkbox interaction issues
    test.skip(
      true,
      'This test is temporarily skipped due to toggle interaction issues in Docker environment',
    );

    const form = await CreateSecretForm.open(page);

    // Enable "No Limit"
    await form.toggleNoLimit(true);

    // Verify the input is disabled
    const isDisabled = await form.accessLimitInput.baseElement.isDisabled();
    expect(isDisabled).toBe(true);

    // Also verify increment/decrement buttons are disabled
    const isIncrementDisabled =
      await form.accessLimitIncrementButton.baseElement.isDisabled();
    const isDecrementDisabled =
      await form.accessLimitDecrementButton.baseElement.isDisabled();
    expect(isIncrementDisabled).toBe(true);
    expect(isDecrementDisabled).toBe(true);
  });

  test.describe('when creating secrets with different access limits', () => {
    test('it should create a secret with a custom access limit', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);
      const testContent = 'Custom access limit test ' + Date.now();
      const customLimit = 5;

      // Set a custom access limit
      await form.setAccessLimit(customLimit);

      // Create the secret
      const metadata = await form.createSecret(testContent);

      // Verify we're on the metadata page
      expect(metadata).toBeInstanceOf(SecretMetadataDisplay);

      // Verify the displayed access count shows our custom limit
      const accessCountText = await metadata.accessCount.getText();
      // Make case-insensitive comparison to handle UI variations
      expect(accessCountText.toLowerCase()).toContain(
        `0 of ${customLimit}`.toLowerCase(),
      );
    });

    test('it should create a secret with unlimited access', async ({
      page,
      browserName,
    }) => {
      // Skip all browsers until we can resolve the toggle interaction issues
      test.skip(
        true,
        'This test is temporarily skipped due to toggle interaction issues in Docker environment',
      );

      const form = await CreateSecretForm.open(page);
      const testContent = 'Unlimited access test ' + Date.now();

      // Enable "No Limit"
      await form.toggleNoLimit(true);

      // Create the secret
      const metadata = await form.createSecretWithOptions(
        testContent,
        'relative',
        { hours: 24, minutes: 0 },
        { noLimit: true },
      );

      // Verify we're on the metadata page
      expect(metadata).toBeInstanceOf(SecretMetadataDisplay);

      // Verify the access count doesn't show a limit
      const accessCountText = await metadata.accessCount.getText();
      expect(accessCountText.toLowerCase()).not.toContain(' of ');

      // Instead of an exact match, check that the text contains "0" and "times"
      expect(accessCountText.toLowerCase()).toContain('0');
      expect(accessCountText.toLowerCase()).toContain('times');
    });
  });
});
