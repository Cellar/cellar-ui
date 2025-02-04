import { expect, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

export const EmptyReactNode: ReactNode = "";

/**
 * Mocks the clipboard functionality for tests.
 * @returns {Clipboard} The mocked Clipboard object.
 */
export function mockClipboard(): Clipboard {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn(),
    },
    writable: true,
  });

  return navigator.clipboard;
}

/**
 * Renders a React component under a specific router path.
 * @param {ReactNode} ui - The React component to render.
 * @param {Object} options - Optional parameters for rendering.
 * @param {string} options.route - The initial route to use.
 * @param {Function} options.loader - Route loader function.
 * @param {string} options.testId - Test id to wait for.
 * @param {string[]} otherPaths - Extra paths to include in the router.
 */
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
  otherPaths: string[] = [],
) {
  window.history.pushState({}, "", route);

  const router = createMemoryRouter(
    [
      {
        path: route,
        element: ui,
        loader: loader,
      },
      ...otherPaths.map((path) => ({ path, element: EmptyReactNode })),
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
