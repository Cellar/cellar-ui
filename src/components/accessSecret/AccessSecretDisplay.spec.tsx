import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ISecret } from "@/models/secret";
import { AccessSecretDisplay } from "./AccessSecretDisplay";
import { userEvent } from "@testing-library/user-event";
import { mockClipboard } from "@tests/helpers";
import { deleteSecret } from "../../api/client";

describe("When rendering SecretMetadataDisplay", () => {
  const secret: ISecret = {
    id: "V5nIvLMxZUYP4",
    content: "TSJ271HWvlSM 0dkxJ0J Cp57zLGlJsgwIl1 Oe510U893sU 7zn",
  };

  beforeEach(async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/secret/:secretId/access",
          element: <AccessSecretDisplay />,
          loader: () => secret,
        },
      ],
      { initialEntries: [`/secret/${secret.id}/access`] },
    );

    render(<RouterProvider router={router} />);
    await waitFor(() => {
      const element = screen.getByTestId("access-secret-form");
      expect(element).toBeInTheDocument();
    });
  });

  it("should render secret content", async () => {
    const element = screen.getByText(secret.content);
    expect(element).toBeInTheDocument();
  });

  it("should have functioning copy button", async () => {
    const element = screen.getByTestId("copy-secret-button");

    const clipboard = mockClipboard();

    await userEvent.click(element);

    expect(clipboard.writeText).toHaveBeenCalledExactlyOnceWith(secret.content);
  });
});
