import { describe, beforeEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { debug } from "vitest-preview";
import { CreateSecretForm } from "./CreateSecretForm";

describe("When rendering SecretMetadataDisplay", () => {
  it("should display", () => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: <CreateSecretForm />,
      },
    ]);

    render(<RouterProvider router={router} />);
    debug();
    const element = screen.getByTestId("secret-content");
    expect(element).toBeInTheDocument();
  });
});
