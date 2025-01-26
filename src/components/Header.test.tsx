import { describe, expect, it} from 'vitest';
import { render, screen } from "@testing-library/react";
import {Header} from "./Header";

describe("When rendering header component", () => {
  it("should display logo", () => {
    render(<Header />);
    const element = screen.getByRole("banner");
    expect(element).toBeInTheDocument();
  });
});
