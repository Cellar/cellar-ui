import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  getByTestId,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CopyButton } from "./CopyButton";
import { userEvent } from "@testing-library/user-event";

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
      it("should not display the checkmark", async () => {
        render(
          <CopyButton
            textToCopy="Hello, World!"
            text="Copy"
            showCheckmark={false}
          />,
        );
        await act(async () => {
          fireEvent.click(screen.getByText("Copy"));
        });
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

  describe("and measuring button dimensions", () => {
    const testScenarios = [
      {
        name: "and confirmation text is shorter",
        text: "Copy this long text",
        confirmationText: "Done",
      },
      {
        name: "and initial text is shorter",
        text: "Copy",
        confirmationText: "Copied Successfully",
      },
    ];

    testScenarios.forEach(({ name, text, confirmationText }) => {
      describe(name, () => {
        [true, false].forEach((showCheckmark) => {
          describe(`and showCheckmark is ${showCheckmark}`, () => {
            it("should maintain the same width through all states", async () => {
              vi.useFakeTimers();

              render(
                <CopyButton
                  textToCopy="Hello, World!"
                  text={text}
                  confirmationText={confirmationText}
                  showCheckmark={showCheckmark}
                />,
              );

              const buttonBefore = screen.getByText(text);
              const initialWidth = buttonBefore.getBoundingClientRect().width;

              await act(async () => {
                fireEvent.click(buttonBefore);
              });

              const buttonDuringCopied = screen.getByText(confirmationText);
              const widthDuringCopied =
                buttonDuringCopied.getBoundingClientRect().width;

              await act(async () => {
                await vi.advanceTimersByTimeAsync(3000);
              });

              const buttonAfter = screen.getByText(text);
              const finalWidth = buttonAfter.getBoundingClientRect().width;

              expect(widthDuringCopied).toBe(initialWidth);
              expect(finalWidth).toBe(initialWidth);

              vi.useRealTimers();
            });
          });
        });
      });
    });
  });

  describe("and setting different appearances", () => {
    const appearances = [
      { type: "primary", expectedClass: "checkPrimary" },
      { type: "secondary", expectedClass: "checkSecondary" },
      { type: "round", expectedClass: "checkRound" },
    ];

    appearances.forEach(({ type, expectedClass }) => {
      it(`should apply correct checkmark class for ${type} appearance`, async () => {
        render(
          <CopyButton
            textToCopy="test"
            text="Copy"
            confirmationText="Copied"
            appearance={type}
            showCheckmark={true}
            id="test-button"
          />,
        );

        fireEvent.click(screen.getByText("Copy"));

        await waitFor(() => {
          const checkmark = document.getElementById("test-button-checkmark");
          expect(checkmark).toBeInTheDocument();
          expect(Array.from(checkmark?.classList ?? []).join(", ")).toContain(
            expectedClass,
          );
        });
      });
    });
  });

  describe("and handling multiple interactions", () => {
    it("should handle multiple rapid clicks correctly", async () => {
      const clipboardWriteMock = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: clipboardWriteMock,
        },
      });
      vi.useFakeTimers();

      const id = "test";
      const textToCopy = "test";
      render(<CopyButton textToCopy={textToCopy} id={id} />);
      const button = screen.getByTestId(`${id}-copy-button`);

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          fireEvent.click(button);
          await vi.advanceTimersByTimeAsync(100);
        });
      }

      expect(clipboardWriteMock).toHaveBeenCalledExactlyOnceWith(textToCopy);
      vi.useRealTimers();
    });

    it("should cleanup timeouts on unmount", async () => {
      vi.useFakeTimers();
      const clipboardWriteMock = vi.fn(() => Promise.resolve());
      Object.assign(navigator, {
        clipboard: {
          writeText: clipboardWriteMock,
        },
      });

      const { unmount } = render(
        <CopyButton textToCopy="test" text="Copy" confirmationText="Copied" />,
      );

      await act(async () => {
        fireEvent.click(screen.getByText("Copy"));
        await clipboardWriteMock();
      });
      expect(screen.getByText("Copied")).toBeInTheDocument();

      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });

      expect(screen.queryByText("Copied")).not.toBeInTheDocument();
      expect(screen.queryByText("Copy")).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
