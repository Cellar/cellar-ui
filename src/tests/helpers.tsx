import { expect, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

export function mockClipboard(): Clipboard {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn(),
    },
    writable: true, // Allow overwriting during the test
  });

  return navigator.clipboard;
}

export async function renderWithRouter(
  ui: ReactNode,
  {
    route = "/",
    loader = undefined,
    testId = undefined,
  }: {
    route?: string;
    loader?: () => Promise<unknown> | unknown;
    testId?: string;
  } = {},
) {
  window.history.pushState({}, "", route);

  const router = createMemoryRouter(
    [
      {
        path: route,
        element: ui,
        loader: loader,
      },
    ],
    { initialEntries: [route] },
  );
  render(<RouterProvider router={router} />);

  if (testId) {
    await waitFor(() => {
      const element = screen.getByTestId(testId);
      expect(element).toBeInTheDocument();
    });
  }
}
