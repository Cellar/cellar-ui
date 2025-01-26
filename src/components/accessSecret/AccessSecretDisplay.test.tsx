import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import React from "react";
import { ISecret } from "../../models/secret";
import { AccessSecretDisplay } from "./AccessSecretDisplay";

describe("When rendering SecretMetadataDisplay", () => {
  it("should display", async () => {
    const secret: ISecret = {
      id: "V5nIvLMxZUYP4",
      content: "TSJ271HWvlSM 0dkxJ0J Cp57zLGlJsgwIl1 Oe510U893sU 7zn",
    };

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
      const element = screen.getByText(secret.content);
      expect(element).toBeInTheDocument();
    });
  });
});
