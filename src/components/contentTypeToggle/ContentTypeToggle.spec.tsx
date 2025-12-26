import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContentTypeToggle } from "./ContentTypeToggle";
import classes from "./ContentTypeToggle.module.css";

describe("ContentTypeToggle", () => {
  describe("when rendered with TEXT selected", () => {
    const onChange = vi.fn();

    beforeEach(() => {
      render(<ContentTypeToggle value="text" onChange={onChange} />);
    });

    it("should display TEXT button", () => {
      expect(screen.getByTestId("content-type-text")).toBeInTheDocument();
    });

    it("should display FILE button", () => {
      expect(screen.getByTestId("content-type-file")).toBeInTheDocument();
    });

    it("should show TEXT as active", () => {
      const textButton = screen.getByTestId("content-type-text");
      expect(textButton).toHaveClass(classes.active);
    });

    it("should not show FILE as active", () => {
      const fileButton = screen.getByTestId("content-type-file");
      expect(fileButton).not.toHaveClass(classes.active);
    });
  });

  describe("when rendered with FILE selected", () => {
    const onChange = vi.fn();

    beforeEach(() => {
      render(<ContentTypeToggle value="file" onChange={onChange} />);
    });

    it("should show FILE as active", () => {
      const fileButton = screen.getByTestId("content-type-file");
      expect(fileButton).toHaveClass(classes.active);
    });

    it("should not show TEXT as active", () => {
      const textButton = screen.getByTestId("content-type-text");
      expect(textButton).not.toHaveClass(classes.active);
    });
  });

  describe("when clicking TEXT button", () => {
    const onChange = vi.fn();

    beforeEach(async () => {
      render(<ContentTypeToggle value="file" onChange={onChange} />);
      await userEvent.click(screen.getByTestId("content-type-text"));
    });

    it("should call onChange with text", () => {
      expect(onChange).toHaveBeenCalledWith("text");
    });
  });

  describe("when clicking FILE button", () => {
    const onChange = vi.fn();

    beforeEach(async () => {
      render(<ContentTypeToggle value="text" onChange={onChange} />);
      await userEvent.click(screen.getByTestId("content-type-file"));
    });

    it("should call onChange with file", () => {
      expect(onChange).toHaveBeenCalledWith("file");
    });
  });

  describe("when disabled", () => {
    const onChange = vi.fn();

    beforeEach(() => {
      render(<ContentTypeToggle value="text" onChange={onChange} disabled />);
    });

    it("should disable TEXT button", () => {
      expect(screen.getByTestId("content-type-text")).toBeDisabled();
    });

    it("should disable FILE button", () => {
      expect(screen.getByTestId("content-type-file")).toBeDisabled();
    });

    describe("and clicking TEXT button", () => {
      beforeEach(async () => {
        await userEvent.click(screen.getByTestId("content-type-text"));
      });

      it("should not call onChange", () => {
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });
});
