import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AccessSecret, AccessSecretLoader } from "./AccessSecret";
import { BrowserRouter } from "react-router-dom";
import * as apiClient from "../api/client";

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

vi.mock("../components/accessSecret/AccessSecretDisplay", () => ({
  AccessSecretDisplay: (props: any) => (
    <div {...props}>AccessSecretDisplay</div>
  ),
}));

describe("AccessSecret page", () => {
  describe("when rendering", () => {
    it("should render Layout with The Secret title", () => {
      render(
        <BrowserRouter>
          <AccessSecret />
        </BrowserRouter>,
      );
      const layout = screen.getByTestId("mock-layout");
      expect(layout).toHaveAttribute("data-title", "The Secret");
    });

    it("should render AccessSecretDisplay component", () => {
      render(
        <BrowserRouter>
          <AccessSecret />
        </BrowserRouter>,
      );
      expect(screen.getByTestId("access-secret-display")).toBeInTheDocument();
    });
  });
});

describe("AccessSecretLoader", () => {
  describe("when called with secretId", () => {
    it("should call accessSecret API with the secretId", async () => {
      const mockAccessSecret = vi.spyOn(apiClient, "accessSecret");
      const mockSecret = {
        id: "test-123",
        content: "test content",
        expiration: Date.now(),
      };
      mockAccessSecret.mockResolvedValue(mockSecret);

      const params = { secretId: "test-123" };
      const result = await AccessSecretLoader({ params });

      expect(mockAccessSecret).toHaveBeenCalledWith("test-123");
      expect(result).toEqual(mockSecret);
    });
  });
});
