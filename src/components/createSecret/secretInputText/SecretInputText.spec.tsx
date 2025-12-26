import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { SecretInputText } from "./SecretInputText";

describe("When rendering SecretInputText", () => {
  describe("and no props are provided", () => {
    it("should display textarea", () => {
      render(<SecretInputText value="" onChange={vi.fn()} />);
      expect(screen.getByTestId("secret-content")).toBeInTheDocument();
    });

    it("should display placeholder", () => {
      render(<SecretInputText value="" onChange={vi.fn()} />);
      expect(
        screen.getByPlaceholderText("Enter Secret Content"),
      ).toBeInTheDocument();
    });

    it("should not display error message", () => {
      render(<SecretInputText value="" onChange={vi.fn()} />);
      expect(
        screen.queryByTestId("secret-content-error"),
      ).not.toBeInTheDocument();
    });
  });

  describe("and value is provided", () => {
    it("should display the value", () => {
      render(<SecretInputText value="test secret" onChange={vi.fn()} />);
      expect(screen.getByTestId("secret-content")).toHaveValue("test secret");
    });
  });

  describe("and user types in textarea", () => {
    it("should call onChange with new value", async () => {
      const onChange = vi.fn();
      render(<SecretInputText value="" onChange={onChange} />);

      await userEvent.type(screen.getByTestId("secret-content"), "new secret");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("and error is provided", () => {
    it("should display error message", () => {
      render(
        <SecretInputText
          value=""
          onChange={vi.fn()}
          error="Secret content is required"
        />,
      );
      expect(screen.getByTestId("secret-content-error")).toHaveTextContent(
        "Secret content is required",
      );
    });
  });

  describe("and mobile prop is true", () => {
    it("should use mobile row count", () => {
      render(<SecretInputText value="" onChange={vi.fn()} mobile />);
      expect(screen.getByTestId("secret-content")).toHaveAttribute(
        "rows",
        "13",
      );
    });
  });

  describe("and mobile prop is false", () => {
    it("should use desktop row count", () => {
      render(<SecretInputText value="" onChange={vi.fn()} mobile={false} />);
      expect(screen.getByTestId("secret-content")).toHaveAttribute(
        "rows",
        "14",
      );
    });
  });
});
