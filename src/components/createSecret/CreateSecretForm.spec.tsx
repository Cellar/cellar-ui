import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { CreateSecretForm } from "./CreateSecretForm";
import { userEvent } from "@testing-library/user-event";
import { renderWithRouter } from "@tests/helpers";
import { createSecret } from "@/api/client";
import { ISecretMetadata } from "src/models/secretMetadata";
import {
  form,
  setExpirationMode,
  adjustAccessLimit,
} from "./CreateSecretForm.spec.model";

const mockMetadata: ISecretMetadata = {
  id: "V5nIvLMxZUYP4",
  access_count: 0,
  access_limit: 5,
  expiration: new Date(),
};

describe("When rendering CreateSecretForm", () => {
  beforeAll(() => {
    vi.mock("@/api/client", () => ({
      createSecret: vi.fn(),
    }));
  });

  beforeEach(() => {
    vi.clearAllMocks();

    renderWithRouter(<CreateSecretForm />, { testId: "secret-content" }, [
      `/secret/${mockMetadata.id}`,
    ]);
  });

  it("should display secret content input field", () => {
    const element = screen.getByTestId("secret-content");
    expect(element).toBeInTheDocument();
  });

  it("should allow typing in the secret content field", async () => {
    const secretContentInput = screen.getByTestId("secret-content");
    await userEvent.type(secretContentInput, "This is a secret");

    expect(secretContentInput).toHaveValue("This is a secret");
  });

  it("should toggle between relative and absolute expiration modes", async () => {
    await setExpirationMode("absolute");
    await setExpirationMode("relative");
  });

  it("should increment and decrement access limit", async () => {
    await adjustAccessLimit("+", 3);
    expect(form.accessLimitInput).toHaveValue("4");

    await adjustAccessLimit("-", 2);
    expect(form.accessLimitInput).toHaveValue("2");
  });

  it("should toggle access limit to 'No Limit'", async () => {
    await userEvent.click(form.noLimitToggle);

    expect(form.noLimitToggle.className).toMatch(/toggled/);
  });

  it("should call 'createSecret' and navigate when the create button is clicked", async () => {
    await userEvent.type(form.secretContentInput, "My Secret");

    vi.mocked(createSecret).mockResolvedValueOnce(mockMetadata);

    await userEvent.click(form.createButton);

    await waitFor(() => {
      expect(createSecret).toHaveBeenCalledExactlyOnceWith(
        "My Secret", // Content
        expect.any(Date), // Expiration
        1, // Access Limit
      );
    });
  });

  it("should disable the create button if no secret content is provided", async () => {
    expect(form.createButton.className).toMatch(/disabled/);
  });
});
