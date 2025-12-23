import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SecretMetadata, SecretMetadataLoader } from "./SecretMetadata";
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

vi.mock("../components/secretMetadata/SecretMetadataDisplay", () => ({
  SecretMetadataDisplay: (props: any) => (
    <div {...props}>SecretMetadataDisplay</div>
  ),
}));

describe("SecretMetadata page", () => {
  describe("when rendering", () => {
    it("should render Layout with Secret Metadata title", () => {
      render(
        <BrowserRouter>
          <SecretMetadata />
        </BrowserRouter>,
      );
      const layout = screen.getByTestId("mock-layout");
      expect(layout).toHaveAttribute("data-title", "Secret Metadata");
    });

    it("should render SecretMetadataDisplay component", () => {
      render(
        <BrowserRouter>
          <SecretMetadata />
        </BrowserRouter>,
      );
      expect(screen.getByTestId("secret-metadata-display")).toBeInTheDocument();
    });
  });
});

describe("SecretMetadataLoader", () => {
  describe("when called with secretId", () => {
    it("should call getSecretMetadata API with the secretId", async () => {
      const mockGetSecretMetadata = vi.spyOn(apiClient, "getSecretMetadata");
      const mockMetadata = {
        id: "test-123",
        expiration: Date.now(),
        access_count: 0,
        access_limit: 5,
      };
      mockGetSecretMetadata.mockResolvedValue(mockMetadata);

      const params = { secretId: "test-123" };
      const result = await SecretMetadataLoader({ params });

      expect(mockGetSecretMetadata).toHaveBeenCalledWith("test-123");
      expect(result).toEqual(mockMetadata);
    });
  });
});
