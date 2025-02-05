import { beforeEach, describe, expect, it } from "vitest";
import { ISecret } from "@/models/secret";
import { AccessSecretDisplay } from "./AccessSecretDisplay";
import { userEvent } from "@testing-library/user-event";
import {
  mockClipboard,
  renderWithRouter,
  waitForVisible,
} from "@tests/helpers";
import { form } from "./AccessSecretDisplay.spec.model";

describe("When rendering SecretMetadataDisplay", () => {
  const secret: ISecret = {
    id: "V5nIvLMxZUYP4",
    content: "TSJ271HWvlSM 0dkxJ0J Cp57zLGlJsgwIl1 Oe510U893sU 7zn",
  };

  beforeEach(async () => {
    await renderWithRouter(<AccessSecretDisplay />, { loader: () => secret });
    await waitForVisible(form);
  });

  it("should render secret content", async () => {
    expect(form.secretContentInput).toBeInTheDocument();
  });

  it("should have functioning copy button", async () => {
    const clipboard = mockClipboard();

    await userEvent.click(form.copyButton);

    expect(clipboard.writeText).toHaveBeenCalledExactlyOnceWith(secret.content);
  });
});
