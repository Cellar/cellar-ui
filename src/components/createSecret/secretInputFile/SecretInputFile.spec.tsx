import { beforeEach, describe, expect, it } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { SecretInputFile, SecretInputFileHandle } from "./SecretInputFile";

describe("When rendering SecretInputFile", () => {
  const maxFileSize = 8 * 1024 * 1024;
  const validFile = new File(["test content"], "test.txt", {
    type: "text/plain",
  });

  describe("and no file is selected", () => {
    let ref: React.RefObject<SecretInputFileHandle>;

    beforeEach(() => {
      ref = createRef<SecretInputFileHandle>();
      render(<SecretInputFile ref={ref} maxFileSize={maxFileSize} />);
    });

    it("should display file upload zone", () => {
      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
    });

    it("should return null from getFile()", () => {
      expect(ref.current?.getFile()).toBeNull();
    });

    it("should return empty error from getError()", () => {
      expect(ref.current?.getError()).toBe("");
    });

    it("should return false from isValid()", () => {
      expect(ref.current?.isValid()).toBe(false);
    });
  });

  [
    {
      description: "valid file",
      file: new File(["test content"], "test.txt", { type: "text/plain" }),
      expectedError: "",
      expectedValid: true,
    },
    {
      description: "oversized file",
      file: new File([new ArrayBuffer(9 * 1024 * 1024)], "large.bin"),
      expectedError: "File exceeds maximum size of 8 MB",
      expectedValid: false,
    },
    {
      description: "empty file",
      file: new File([], "empty.txt"),
      expectedError: "Empty files are not allowed",
      expectedValid: false,
    },
  ].forEach(({ description, file, expectedError, expectedValid }) => {
    describe(`and ${description} is selected`, () => {
      let ref: React.RefObject<SecretInputFileHandle>;

      beforeEach(async () => {
        ref = createRef<SecretInputFileHandle>();
        render(<SecretInputFile ref={ref} maxFileSize={maxFileSize} />);

        const input = screen.getByTestId("file-input") as HTMLInputElement;
        await userEvent.upload(input, file);
      });

      it("should return file from getFile()", () => {
        expect(ref.current?.getFile()).toBe(file);
      });

      it(`should return ${expectedValid ? "true" : "false"} from isValid()`, () => {
        expect(ref.current?.isValid()).toBe(expectedValid);
      });

      if (expectedError) {
        it("should return error from getError()", () => {
          expect(ref.current?.getError()).toContain(expectedError);
        });

        it("should display error message", () => {
          expect(screen.getByTestId("file-upload-error")).toHaveTextContent(
            expectedError,
          );
        });
      } else {
        it("should return empty error from getError()", () => {
          expect(ref.current?.getError()).toBe("");
        });

        it("should not display error message", () => {
          expect(
            screen.queryByTestId("file-upload-error"),
          ).not.toBeInTheDocument();
        });
      }

      describe("and clicking remove button", () => {
        beforeEach(async () => {
          await userEvent.click(screen.getByTestId("remove-file-button"));
        });

        it("should clear the file", () => {
          expect(ref.current?.getFile()).toBeNull();
        });

        it("should clear the error", () => {
          expect(ref.current?.getError()).toBe("");
        });

        it("should return false from isValid()", () => {
          expect(ref.current?.isValid()).toBe(false);
        });
      });
    });
  });

  describe("and file is selected", () => {
    let ref: React.RefObject<SecretInputFileHandle>;

    beforeEach(async () => {
      ref = createRef<SecretInputFileHandle>();
      render(<SecretInputFile ref={ref} maxFileSize={maxFileSize} />);

      const input = screen.getByTestId("file-input") as HTMLInputElement;
      await userEvent.upload(input, validFile);
    });

    it("should display selected file info", () => {
      expect(screen.getByTestId("selected-file-info")).toBeInTheDocument();
    });

    it("should display remove button", () => {
      expect(screen.getByTestId("remove-file-button")).toBeInTheDocument();
    });
  });
});
