import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Footer } from "./footer";
import { BrowserRouter } from "react-router-dom";

global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

describe("Footer component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when rendering", () => {
    it("should render a link to cellar-app.io", () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://cellar-app.io/");
    });

    it("should display About Cellar text", () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>,
      );
      expect(screen.getByText("About Cellar")).toBeInTheDocument();
    });

    it("should display version number", () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>,
      );
      const version = screen.getByTestId("footer-version");
      expect(version).toBeInTheDocument();
      expect(version.textContent).toMatch(/^v\d+\.\d+\.\d+$/);
    });

    it("should open link in new tab", () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
    });

    describe("and with parent element", () => {
      it("should calculate minHeight based on sibling heights", async () => {
        render(
          <div>
            <div style={{ height: "100px" }}>Sibling 1</div>
            <div style={{ height: "50px" }}>Sibling 2</div>
            <BrowserRouter>
              <Footer />
            </BrowserRouter>
          </div>,
        );

        const link = screen.getByText("About Cellar");
        const footerContent = link.parentElement as HTMLElement;
        const footerContainer = footerContent.parentElement as HTMLElement;

        await waitFor(() => {
          expect(footerContainer.style.minHeight).toBeTruthy();
        });
      });
    });

    describe("and on unmount", () => {
      it("should cleanup resize observer", () => {
        const { unmount } = render(
          <BrowserRouter>
            <Footer />
          </BrowserRouter>,
        );

        expect(() => unmount()).not.toThrow();
      });
    });
  });
});
