import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUploadZone } from "./FileUploadZone";
import classes from "./FileUploadZone.module.css";

describe("FileUploadZone", () => {
  describe("when rendered without a file", () => {
    const onFileSelect = vi.fn();

    beforeEach(() => {
      render(<FileUploadZone onFileSelect={onFileSelect} />);
    });

    it("should display the upload zone", () => {
      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
    });

    it("should show drag and drop text", () => {
      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    });

    it("should show browse text", () => {
      expect(screen.getByText(/browse/i)).toBeInTheDocument();
    });

    it("should have a file input", () => {
      expect(screen.getByTestId("file-input")).toBeInTheDocument();
    });

    it("should not show selected file info", () => {
      expect(
        screen.queryByTestId("selected-file-info"),
      ).not.toBeInTheDocument();
    });

    it("should not show remove button", () => {
      expect(
        screen.queryByTestId("remove-file-button"),
      ).not.toBeInTheDocument();
    });
  });

  describe("when rendered with an error", () => {
    const onFileSelect = vi.fn();
    const errorMessage = "File is too large";

    beforeEach(() => {
      render(
        <FileUploadZone onFileSelect={onFileSelect} error={errorMessage} />,
      );
    });

    it("should display the error message", () => {
      expect(screen.getByTestId("file-upload-error")).toBeInTheDocument();
    });

    it("should show the error text", () => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe("when selecting a file via click", () => {
    const onFileSelect = vi.fn();
    const testFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    beforeEach(async () => {
      render(<FileUploadZone onFileSelect={onFileSelect} />);
      const input = screen.getByTestId("file-input") as HTMLInputElement;
      await userEvent.upload(input, testFile);
    });

    it("should call onFileSelect with the file", () => {
      expect(onFileSelect).toHaveBeenCalledWith(testFile);
    });
  });

  describe("when rendered with a selected file", () => {
    const onFileSelect = vi.fn();
    const onRemove = vi.fn();
    const selectedFile = new File(["test content"], "document.pdf", {
      type: "application/pdf",
    });

    beforeEach(() => {
      render(
        <FileUploadZone
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          onRemove={onRemove}
        />,
      );
    });

    it("should show selected file info", () => {
      expect(screen.getByTestId("selected-file-info")).toBeInTheDocument();
    });

    it("should display the filename", () => {
      expect(screen.getByText("document.pdf")).toBeInTheDocument();
    });

    it("should display the file size", () => {
      expect(screen.getByTestId("selected-file-size")).toBeInTheDocument();
    });

    it("should show remove button", () => {
      expect(screen.getByTestId("remove-file-button")).toBeInTheDocument();
    });

    it("should not show drag and drop text", () => {
      expect(screen.queryByText(/drag and drop/i)).not.toBeInTheDocument();
    });

    describe("and clicking remove button", () => {
      beforeEach(async () => {
        await userEvent.click(screen.getByTestId("remove-file-button"));
      });

      it("should call onRemove", () => {
        expect(onRemove).toHaveBeenCalled();
      });
    });
  });

  describe("when disabled", () => {
    const onFileSelect = vi.fn();

    beforeEach(() => {
      render(<FileUploadZone onFileSelect={onFileSelect} disabled />);
    });

    it("should disable the file input", () => {
      expect(screen.getByTestId("file-input")).toBeDisabled();
    });

    it("should have disabled styling", () => {
      const zone = screen.getByTestId("file-upload-zone");
      expect(zone).toHaveClass(classes.disabled);
    });

    describe("and trying to select a file", () => {
      beforeEach(async () => {
        const input = screen.getByTestId("file-input") as HTMLInputElement;
        const testFile = new File(["test"], "test.txt", { type: "text/plain" });
        await userEvent.upload(input, testFile);
      });

      it("should not call onFileSelect", () => {
        expect(onFileSelect).not.toHaveBeenCalled();
      });
    });
  });

  describe("when dragging a file over the zone", () => {
    const onFileSelect = vi.fn();

    beforeEach(() => {
      render(<FileUploadZone onFileSelect={onFileSelect} />);
    });

    describe("and file enters the zone", () => {
      beforeEach(() => {
        const zone = screen.getByTestId("file-upload-zone");
        fireEvent.dragEnter(zone, {
          dataTransfer: { types: ["Files"] },
        });
      });

      it("should add dragging class", () => {
        const zone = screen.getByTestId("file-upload-zone");
        expect(zone).toHaveClass(classes.dragging);
      });

      describe("and file leaves the zone", () => {
        beforeEach(() => {
          const zone = screen.getByTestId("file-upload-zone");
          fireEvent.dragLeave(zone);
        });

        it("should remove dragging class", () => {
          const zone = screen.getByTestId("file-upload-zone");
          expect(zone).not.toHaveClass(classes.dragging);
        });
      });

      describe("and file is dropped", () => {
        const testFile = new File(["content"], "dropped.txt", {
          type: "text/plain",
        });

        beforeEach(() => {
          const zone = screen.getByTestId("file-upload-zone");
          fireEvent.drop(zone, {
            dataTransfer: {
              files: [testFile],
              types: ["Files"],
            },
          });
        });

        it("should call onFileSelect with the file", () => {
          expect(onFileSelect).toHaveBeenCalledWith(testFile);
        });

        it("should remove dragging class", () => {
          const zone = screen.getByTestId("file-upload-zone");
          expect(zone).not.toHaveClass(classes.dragging);
        });
      });
    });
  });

  describe("when disabled and dragging a file", () => {
    const onFileSelect = vi.fn();

    beforeEach(() => {
      render(<FileUploadZone onFileSelect={onFileSelect} disabled />);
    });

    describe("and file is dropped", () => {
      const testFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });

      beforeEach(() => {
        const zone = screen.getByTestId("file-upload-zone");
        fireEvent.drop(zone, {
          dataTransfer: {
            files: [testFile],
          },
        });
      });

      it("should not call onFileSelect", () => {
        expect(onFileSelect).not.toHaveBeenCalled();
      });
    });
  });
});
