import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Layout } from "./Layout";
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

describe("Layout component", () => {
  describe("when rendering without title", () => {
    it("should render Header component", () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Child content</div>
          </Layout>
        </BrowserRouter>,
      );
      expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    });

    it("should render Footer component", () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Child content</div>
          </Layout>
        </BrowserRouter>,
      );
      expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
    });

    it("should render children in main element", () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Child content</div>
          </Layout>
        </BrowserRouter>,
      );
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("should not render NewSecretButton", () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Child content</div>
          </Layout>
        </BrowserRouter>,
      );
      expect(
        screen.queryByTestId("mock-new-secret-button"),
      ).not.toBeInTheDocument();
    });

    it("should not render title heading", () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Child content</div>
          </Layout>
        </BrowserRouter>,
      );
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });

  describe("when rendering with title", () => {
    it("should render the title in h1", () => {
      render(
        <BrowserRouter>
          <Layout title="Test Title">
            <div>Child content</div>
          </Layout>
        </BrowserRouter>,
      );
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Test Title",
      );
    });

    it("should render NewSecretButton", () => {
      render(
        <BrowserRouter>
          <Layout title="Test Title">
            <div>Child content</div>
          </Layout>
        </BrowserRouter>,
      );
      expect(screen.getByTestId("mock-new-secret-button")).toBeInTheDocument();
    });

    it("should render children in main element", () => {
      render(
        <BrowserRouter>
          <Layout title="Test Title">
            <div>Child content</div>
          </Layout>
        </BrowserRouter>,
      );
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });
  });
});
