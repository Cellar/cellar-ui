import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotFound } from "./NotFound";
import { BrowserRouter } from "react-router-dom";

vi.mock("../components/header/Header", () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock("../components/footer/footer", () => ({
  Footer: () => <div data-testid="mock-footer">Footer</div>,
}));

vi.mock("../components/buttons/NewSecretButton", () => ({
  NewSecretButton: () => (
    <div data-testid="mock-new-secret-button">New Secret Button</div>
  ),
}));

describe("NotFound page", () => {
  describe("when rendering", () => {
    it("should render Header component", () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>,
      );
      expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    });

    it("should render Footer component", () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>,
      );
      expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
    });

    it("should display No Secrets Here heading", () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>,
      );
      expect(
        screen.getByRole("heading", { name: /No Secrets Here/i }),
      ).toBeInTheDocument();
    });

    it("should display not found message", () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>,
      );
      expect(
        screen.getByText(/Sorry, but the page you were trying/i),
      ).toBeInTheDocument();
    });

    it("should render link to create new secret", () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>,
      );
      const link = screen.getByRole("link", { name: /here/i });
      expect(link).toHaveAttribute("href", "/secret/create");
    });

    it("should render NewSecretButton", () => {
      render(
        <BrowserRouter>
          <NotFound />
        </BrowserRouter>,
      );
      expect(screen.getByTestId("mock-new-secret-button")).toBeInTheDocument();
    });
  });
});
