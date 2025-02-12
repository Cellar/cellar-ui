import { expect, vi, MockInstance } from "vitest";
import {
  createMemoryRouter,
  LoaderFunction,
  RouterProvider,
} from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { padNum } from "@/helpers/helpers";

export const EmptyReactNode: ReactNode = "";

export function mockNavigate(): MockInstance {
  const mockFn = vi.fn();
  vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
      ...actual,
      useNavigate: vi.fn(() => mockFn),
    };
  });
  return mockFn;
}

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

export function getSecretContent() {
  return `My secret - ${crypto.randomUUID()}`;
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
    loader?: LoaderFunction;
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
        loader: loader as LoaderFunction | undefined,
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

export async function waitForVisible(
  form: { self: HTMLElement },
  timeout = 1000,
) {
  await waitFor(
    () => {
      expect(form.self).toBeInTheDocument();
    },
    { timeout },
  );
}

export function formatDateForParsing(date: Date | string): string {
  if (typeof date === "string") date = new Date(date);
  return `${date.getFullYear()}-${padNum(date.getMonth() + 1, 2)}-${padNum(date.getDate(), 2)}`;
}
