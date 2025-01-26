import { describe, beforeEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ISecretMetadata } from "../../models/secretMetadata";
import { IApiError } from "../../models/error";
import { SecretMetadataDisplay } from "./SecretMetadataDisplay";
import React from "react";

describe("When rendering SecretMetadataDisplay", () => {
  it("should display", async () => {
    const secretMetadata: ISecretMetadata = {
      id: "V5nIvLMxZUYP4",
      access_count: 0,
      access_limit: 5,
      expiration: new Date(),
    };

    const router = createMemoryRouter(
      [
        {
          path: "/secret/:secretId",
          element: <SecretMetadataDisplay />,
          loader: () => secretMetadata,
        },
      ],
      { initialEntries: [`/secret/${secretMetadata.id}`] },
    );

    render(<RouterProvider router={router} />);
    await waitFor(() => {
      const element = screen.getByText(secretMetadata.id);
      expect(element).toBeInTheDocument();
    });
  });
});
