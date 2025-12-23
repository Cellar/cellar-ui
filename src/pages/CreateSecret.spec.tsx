import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CreateSecret } from "./CreateSecret";
import { BrowserRouter } from "react-router-dom";

vi.mock("../layouts/Layout", () => ({
  Layout: ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="mock-layout" data-title={title}>
      {children}
    </div>
  ),
}));

vi.mock("../components/createSecret/CreateSecretForm", () => ({
  CreateSecretForm: (props: any) => <div {...props}>CreateSecretForm</div>,
}));

describe("CreateSecret page", () => {
  describe("when rendering", () => {
    it("should render Layout with Create a Secret title", () => {
      render(
        <BrowserRouter>
          <CreateSecret />
        </BrowserRouter>,
      );
      const layout = screen.getByTestId("mock-layout");
      expect(layout).toHaveAttribute("data-title", "Create a Secret");
    });

    it("should render CreateSecretForm component", () => {
      render(
        <BrowserRouter>
          <CreateSecret />
        </BrowserRouter>,
      );
      expect(screen.getByTestId("create-secret-form")).toBeInTheDocument();
    });
  });
});
