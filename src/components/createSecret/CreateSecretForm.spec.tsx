import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";
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
    expect(form.secretContentInput).toBeInTheDocument();
  });

  it("should display absolute expiration option", () => {
    expect(form.absoluteExpirationOption).toBeInTheDocument();
  });

  it("should display relative expiration inputs", () => {
    expect(
      form.relativeExpirationModel.expirationRelativeButton,
    ).toBeInTheDocument();
  });

  it("should display ");

  describe("and modifying the secret content", () => {
    it("should allow typing in the secret content field", async () => {
      await userEvent.type(form.secretContentInput, "This is a secret");

      expect(form.secretContentInput).toHaveValue("This is a secret");
    });
  });

  describe("and modifying the expiration", () => {
    it("should toggle between relative and absolute expiration modes", async () => {
      await setExpirationMode("absolute");
      await setExpirationMode("relative");
    });
  });

  describe("and modifying the access limit", () => {
    it("should increment access limit", async () => {
      await adjustAccessLimit("+", 3);
      expect(form.accessLimitInput).toHaveValue("4");
    });

    it("should decrement access limit", async () => {
      await adjustAccessLimit("+", 4);
      await adjustAccessLimit("-", 2);
      expect(form.accessLimitInput).toHaveValue("3");
    });

    it("should allow typing into access limit", async () => {
      await userEvent.dblClick(form.accessLimitInput); // in order to highlight and replace current value
      await userEvent.keyboard("7");
      expect(form.accessLimitInput).toHaveValue("7");
    });

    describe("and disabling access limit", () => {
      it("should toggle access limit to 'No Limit'", async () => {
        await userEvent.click(form.noLimitToggle);

        expect(form.noLimitToggle.className).toMatch(/toggled/);
      });

      it("should disable access limit input", async () => {
        await userEvent.click(form.noLimitToggle);

        expect(form.accessLimitInput).toBeDisabled();
      });

      it("should disable increment access limit button", async () => {
        await userEvent.click(form.noLimitToggle);

        expect(form.increaseAccessLimitButton).toBeDisabled();
      });

      it("should disable decrement access limit button", async () => {
        await userEvent.click(form.noLimitToggle);

        expect(form.decreaseAccessLimitButton).toBeDisabled();
      });
    });
  });

  describe("and all inputs filled out correctly", () => {
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
  });

  describe("and inputs are not filled out correctly", () => {
    it("should display an error message when submitting an empty secret", async () => {
      await userEvent.clear(form.secretContentInput);
      await userEvent.click(form.createButton);
      await waitFor(() => {
        expect(form.secretContentError).toBeInTheDocument();
      });
    });

    it("should be unable to set access limit to a non-positive number", async () => {
      fireEvent.change(form.accessLimitInput, { target: { value: "-1" } });
      expect(+form.accessLimitInput.value).toBeGreaterThan(0);
    });

    it("should display an error when relative expiration is in 0 minutes", async () => {
      await userEvent.clear(form.relativeExpirationModel.hoursInput);
      await userEvent.type(form.relativeExpirationModel.hoursInput, "0");
      await userEvent.clear(form.relativeExpirationModel.minutesInput);
      await userEvent.type(form.relativeExpirationModel.minutesInput, "0");
      await userEvent.click(form.createButton);
      await waitFor(() => {
        expect(form.expirationError).toBeInTheDocument();
      });
    });
  });
});
