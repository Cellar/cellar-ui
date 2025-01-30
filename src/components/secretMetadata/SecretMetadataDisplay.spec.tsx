import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { ISecretMetadata } from "@/models/secretMetadata";
import { SecretMetadataDisplay } from "./SecretMetadataDisplay";
import { renderWithRouter } from "@tests/helpers";

describe("When rendering SecretMetadataDisplay", () => {
  const secretMetadata: ISecretMetadata = {
    id: "V5nIvLMxZUYP4",
    access_count: 0,
    access_limit: 5,
    expiration: new Date(),
  };

  beforeEach(async () => {
    await renderWithRouter(<SecretMetadataDisplay />, {
      loader: () => secretMetadata,
      testId: "details-label",
    });
  });

  it("should display", async () => {
    await waitFor(() => {
      const element = screen.getByText(secretMetadata.id);
      expect(element).toBeInTheDocument();
    });
  });
});
