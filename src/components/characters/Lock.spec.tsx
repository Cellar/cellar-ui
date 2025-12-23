import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Lock } from "./Lock";

describe("Lock component", () => {
  describe("when rendering", () => {
    it("should render an svg element", () => {
      const { container } = render(<Lock />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    describe("and with an id prop", () => {
      it("should apply the id to the svg", () => {
        const { container } = render(<Lock id="test-lock" />);
        const svg = container.querySelector("#test-lock");
        expect(svg).toBeInTheDocument();
      });
    });

    describe("and with a className prop", () => {
      it("should apply the className to the svg", () => {
        const { container } = render(<Lock className="custom-class" />);
        const svg = container.querySelector("svg.custom-class");
        expect(svg).toBeInTheDocument();
      });
    });

    describe("and with additional props", () => {
      it("should spread props to the svg element", () => {
        const { container } = render(<Lock data-testid="lock-icon" />);
        const svg = container.querySelector('[data-testid="lock-icon"]');
        expect(svg).toBeInTheDocument();
      });
    });
  });
});
