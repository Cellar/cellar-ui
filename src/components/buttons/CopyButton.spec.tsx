import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CopyButton } from "./CopyButton";

describe("When rendering CopyButton", () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: mockWriteText,
      },
    });
  });

  describe("and initially displaying the button", () => {
    it("should show the correct initial text", () => {
      render(<CopyButton textToCopy="Hello, World!" text="Copy" />);
      expect(screen.getByText("Copy")).toBeInTheDocument();
    });
  });

  describe("and clicking the button", () => {
    it("should copy the text to the clipboard", async () => {
      render(<CopyButton textToCopy="Hello, World!" text="Copy" />);
      fireEvent.click(screen.getByText("Copy"));
      await waitFor(() =>
        expect(mockWriteText).toHaveBeenCalledWith("Hello, World!"),
      );
    });

    it("should display the confirmation text", async () => {
      render(
        <CopyButton
          textToCopy="Hello, World!"
          text="Copy"
          confirmationText="Copied"
        />,
      );
      fireEvent.click(screen.getByText("Copy"));
      await waitFor(() =>
        expect(screen.getByText("Copied")).toBeInTheDocument(),
      );
    });

    describe("and waiting for 3 seconds", () => {
      it("should reset the display text back to original", async () => {
        vi.useFakeTimers();

        const clipboardWriteMock = vi.fn(() => Promise.resolve());
        Object.assign(navigator, {
          clipboard: {
            writeText: clipboardWriteMock,
          },
        });
        render(
          <CopyButton
            textToCopy="Hello, World!"
            text="Copy"
            confirmationText="Copied"
          />,
        );

        await act(async () => {
          fireEvent.click(screen.getByText("Copy"));
          await clipboardWriteMock();
        });

        expect(screen.getByText("Copied")).toBeInTheDocument();
        await act(async () => {
          await vi.advanceTimersByTimeAsync(3000);
        });

        expect(screen.getByText("Copy")).toBeInTheDocument();

        vi.useRealTimers();
      });
    });
  });

  describe("and configuring checkmark visibility", () => {
    describe("and showCheckmark is false", () => {
      it("should not display the checkmark", () => {
        render(
          <CopyButton
            textToCopy="Hello, World!"
            text="Copy"
            showCheckmark={false}
          />,
        );
        fireEvent.click(screen.getByText("Copy"));
        expect(screen.queryByTestId(/checkmark/i)).not.toBeInTheDocument();
      });
    });

    describe("and showCheckmark is true", () => {
      it("should display the checkmark when confirmation text is shown", async () => {
        render(
          <CopyButton
            id="test-button"
            textToCopy="Hello, World!"
            text="Copy"
            confirmationText="Copied"
            showCheckmark={true}
          />,
        );

        fireEvent.click(screen.getByText("Copy"));

        await waitFor(() => {
          expect(screen.getByText("Copied")).toBeInTheDocument();
          expect(
            document.getElementById("test-button-checkmark"),
          ).toBeInTheDocument();
        });
      });
    });
  });
});
