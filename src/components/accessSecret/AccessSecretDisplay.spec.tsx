import { beforeEach, describe, expect, it, vi } from "vitest";
import { ISecret } from "@/models/secret";
import { AccessSecretDisplay } from "./AccessSecretDisplay";
import { userEvent } from "@testing-library/user-event";
import {
  mockClipboard,
  renderWithRouter,
  waitForVisible,
} from "@tests/helpers";
import { form } from "./AccessSecretDisplay.spec.model";
import { screen, waitFor } from "@testing-library/react";
import { formatFileSize } from "@/helpers/formatFileSize";

describe("When rendering AccessSecretDisplay with text secret", () => {
  const secret: ISecret = {
    id: "V5nIvLMxZUYP4",
    content: "TSJ271HWvlSM 0dkxJ0J Cp57zLGlJsgwIl1 Oe510U893sU 7zn",
    contentType: "text",
  };

  beforeEach(async () => {
    await renderWithRouter(<AccessSecretDisplay />, { loader: () => secret });
    await waitForVisible(form);
  });

  it("should render secret content", async () => {
    expect(form.secretContentInput).toBeInTheDocument();
  });

  it("should render text content in textarea", async () => {
    expect(form.secretContentInput).toHaveValue(secret.content);
  });

  it("should render copy button", async () => {
    expect(form.copyButton).toBeInTheDocument();
  });

  it("should not render file info", async () => {
    expect(screen.queryByTestId("file-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("file-size")).not.toBeInTheDocument();
  });

  it("should not render save file button", async () => {
    expect(screen.queryByTestId("save-file-button")).not.toBeInTheDocument();
  });

  it("should have functioning copy button", async () => {
    const clipboard = mockClipboard();

    await userEvent.click(form.copyButton);

    expect(clipboard.writeText).toHaveBeenCalledExactlyOnceWith(secret.content);
  });
});

describe("When rendering AccessSecretDisplay with file secret", () => {
  const fileContent = new Uint8Array([1, 2, 3, 4, 5]);
  const testBlob = new Blob([fileContent], {
    type: "application/octet-stream",
  });
  const secret: ISecret = {
    id: "V5nIvLMxZUYP4",
    content: "",
    contentType: "file",
    filename: "test-document.pdf",
    fileBlob: testBlob,
  };

  beforeEach(async () => {
    await renderWithRouter(<AccessSecretDisplay />, { loader: () => secret });
    await waitFor(() => {
      expect(screen.getByTestId("save-file-button")).toBeInTheDocument();
    });
  });

  it("should render file info card", async () => {
    expect(screen.getByTestId("file-name")).toBeInTheDocument();
  });

  it("should display filename", async () => {
    expect(screen.getByTestId("file-name")).toHaveTextContent(
      "test-document.pdf",
    );
  });

  it("should display file size with appropriate units", async () => {
    expect(screen.getByTestId("file-size")).toHaveTextContent(
      formatFileSize(testBlob.size),
    );
  });

  it("should render save file button", async () => {
    expect(screen.getByTestId("save-file-button")).toBeInTheDocument();
  });

  it("should not render textarea", async () => {
    expect(screen.queryByTestId("secret-content")).not.toBeInTheDocument();
  });

  it("should not render copy button", async () => {
    expect(screen.queryByTestId("copy-secret-button")).not.toBeInTheDocument();
  });

  it("should have save file button enabled", () => {
    expect(screen.getByTestId("save-file-button")).not.toBeDisabled();
  });
});
