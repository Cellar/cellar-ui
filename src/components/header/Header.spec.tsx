import "@testing-library/jest-dom";
import { describe, expect, it, vi, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";
import { useMediaQuery } from "@mantine/hooks"; // Mocked dependency

vi.mock("@mantine/hooks", () => ({
  useMediaQuery: vi.fn(),
}));

describe("When rendering header component", () => {
  it("should render banner with tagline", () => {
    render(<Header />);
    const element = screen.getByTestId("banner");
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent(
      "Share sensitive information securely with cellar. End to end encryption, always free. No sign-up required.",
      { normalizeWhitespace: true },
    );
  });

  it("should render logo", () => {
    render(<Header />);
    const element = screen.getByTestId("cellar-logo");
    expect(element).toBeInTheDocument();
  });

  it("should update tagline on narrow screens (max-width: 393px)", () => {
    (useMediaQuery as Mock).mockReturnValue(true); // Simulate narrow screen
    render(<Header />);
    const element = screen.getByTestId("banner");
    expect(element).toBeInTheDocument();
    expect(element.textContent).toMatch(
      /Share sensitive information securely with cellar\.[\s\n]*End to end encryption, always free\. No sign-up required\./,
    );
  });
});
