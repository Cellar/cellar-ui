import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { SecretInputFile } from "./SecretInputFile";

describe("When rendering SecretInputFile", () => {
  const maxFileSize = 8 * 1024 * 1024;
  const testFile = new File(["test content"], "test.txt", {
    type: "text/plain",
  });

  describe("and no file is selected", () => {
    beforeEach(() => {
      render(
        <SecretInputFile
          selectedFile={null}
          onFileSelect={vi.fn()}
          onRemove={vi.fn()}
          maxFileSize={maxFileSize}
        />,
      );
    });

    it("should display file upload zone", () => {
      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
    });

    it("should not display error", () => {
      expect(screen.queryByTestId("file-upload-error")).not.toBeInTheDocument();
    });

    it("should not display selected file info", () => {
      expect(
        screen.queryByTestId("selected-file-info"),
      ).not.toBeInTheDocument();
    });
  });

  describe("and file is selected", () => {
    const onRemove = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      render(
        <SecretInputFile
          selectedFile={testFile}
          onFileSelect={vi.fn()}
          onRemove={onRemove}
          maxFileSize={maxFileSize}
        />,
      );
    });

    it("should display selected file info", () => {
      expect(screen.getByTestId("selected-file-info")).toBeInTheDocument();
    });

    it("should display remove button", () => {
      expect(screen.getByTestId("remove-file-button")).toBeInTheDocument();
    });

    describe("and clicking remove button", () => {
      it("should call onRemove", async () => {
        await userEvent.click(screen.getByTestId("remove-file-button"));
        expect(onRemove).toHaveBeenCalledOnce();
      });
    });
  });

  describe("and selecting files", () => {
    [
      {
        description: "valid file",
        file: new File(["test content"], "test.txt", { type: "text/plain" }),
        expectedError: null,
      },
      {
        description: "oversized file",
        file: new File([new ArrayBuffer(9 * 1024 * 1024)], "large.bin"),
        expectedError: "File exceeds maximum size of 8 MB",
      },
      {
        description: "empty file",
        file: new File([], "empty.txt"),
        expectedError: "Empty files are not allowed",
      },
    ].forEach(({ description, file, expectedError }) => {
      describe(`and selecting ${description}`, () => {
        const onFileSelect = vi.fn();

        beforeEach(async () => {
          vi.clearAllMocks();
          render(
            <SecretInputFile
              selectedFile={null}
              onFileSelect={onFileSelect}
              onRemove={vi.fn()}
              maxFileSize={maxFileSize}
            />,
          );

          const input = screen.getByTestId("file-input") as HTMLInputElement;
          await userEvent.upload(input, file);
        });

        it("should call onFileSelect with file", () => {
          expect(onFileSelect).toHaveBeenCalledWith(file, expectedError);
        });

        if (expectedError === null) {
          it("should pass no error to onFileSelect", () => {
            expect(onFileSelect).toHaveBeenCalledWith(expect.any(File), null);
          });
        } else {
          it("should pass error to onFileSelect", () => {
            expect(onFileSelect).toHaveBeenCalledWith(
              expect.any(File),
              expect.stringContaining(expectedError),
            );
          });
        }
      });
    });
  });

  describe("and error prop is provided", () => {
    beforeEach(() => {
      render(
        <SecretInputFile
          selectedFile={testFile}
          onFileSelect={vi.fn()}
          onRemove={vi.fn()}
          maxFileSize={maxFileSize}
          error="File too large"
        />,
      );
    });

    it("should display error message", () => {
      expect(screen.getByTestId("file-upload-error")).toHaveTextContent(
        "File too large",
      );
    });
  });
});
