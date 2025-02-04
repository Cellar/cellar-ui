import { beforeEach, beforeAll, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { ISecretMetadata } from "@/models/secretMetadata";
import { SecretMetadataDisplay } from "./SecretMetadataDisplay";
import { mockClipboard, renderWithRouter } from "@tests/helpers";
import { userEvent } from "@testing-library/user-event";
import { deleteSecret } from "@/api/client";

describe("When rendering SecretMetadataDisplay", () => {
  const secretMetadata: ISecretMetadata = {
    id: "V5nIvLMxZUYP4",
    access_count: 0,
    access_limit: 5,
    expiration: new Date(),
  };

  let clipboard: Clipboard;

  beforeAll(() => {
    clipboard = mockClipboard();
    global.confirm = vi.fn(() => true);
    vi.mock("@/api/client", () => ({
      deleteSecret: vi.fn(),
    }));
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    await renderWithRouter(
      <SecretMetadataDisplay />,
      {
        loader: () => secretMetadata,
        testId: "details-label",
      },
      ["/secret/create"],
    );
  });

  it("should display", async () => {
    await waitFor(() => {
      const element = screen.getByText(secretMetadata.id);
      expect(element).toBeInTheDocument();
    });
  });

  it("should have a functioning copy secret link button", async () => {
    const element = screen.getByTestId("copy-secret-link-button");

    await userEvent.click(element);

    expect(clipboard.writeText).toHaveBeenCalledExactlyOnceWith(
      `http://localhost:3000/secret/${secretMetadata.id}/access`,
    );
  });

  it("should have a functioning copy metadata link button", async () => {
    const element = screen.getByTestId("copy-metadata-link-button");

    await userEvent.click(element);

    expect(clipboard.writeText).toHaveBeenCalledExactlyOnceWith(
      `http://localhost:3000/secret/${secretMetadata.id}`,
    );
  });

  it("should call deleteSecret when the button is clicked", async () => {
    const element = screen.getByTestId("delete-secret-button");

    await userEvent.click(element);

    expect(deleteSecret).toHaveBeenCalledExactlyOnceWith(secretMetadata.id);
  });
});
