import "@testing-library/jest-dom";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("When rendering header component", () => {
  it("should render banner with tagline", () => {
    render(<Header />);
    const element = screen.getByRole("banner");
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
});
