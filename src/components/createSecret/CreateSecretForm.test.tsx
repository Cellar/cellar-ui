import { describe, beforeEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
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
    const element = screen.getByTestId("secret-content");
    expect(element).toBeInTheDocument();
  });
});
