import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CopyButton } from "./CopyButton";
import { getRandomString } from "@tests/helpers";

function renderCopyButton({
  text = "Copy",
  confirmationText = "Copied",
  textToCopy = "Test text",
  ...props
}): { testId: string; unmount: () => void } {
  const id = `test-button-${getRandomString()}`;
  const { unmount } = render(
    <CopyButton
      id={id}
      text={text}
      confirmationText={confirmationText}
      textToCopy={textToCopy}
      {...props}
    />,
  );

  return { testId: `${id}-copy-button`, unmount };
}

function clickCopyButton(testId: string) {
  fireEvent.click(screen.getByTestId(testId));
}

const checkmark = () => screen.queryByTestId(/checkmark/i);

const copyButtonByText = (text: string) => screen.getByText(text);
describe("When rendering CopyButton", () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockWriteText.mockClear();
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: mockWriteText,
      },
    });
  });

  describe("and initially displaying the button", () => {
    it("should show the correct initial text", () => {
      const text = getRandomString();
      renderCopyButton({ text });
      expect(copyButtonByText(text)).toBeInTheDocument();
    });
  });

  describe("and clicking the button", () => {
    it("should copy the text to the clipboard", async () => {
      const textToCopy = `${getRandomString()} ${getRandomString()} ${getRandomString()}`;
      const { testId } = renderCopyButton({ textToCopy });
      clickCopyButton(testId);
      await waitFor(() =>
        expect(mockWriteText).toHaveBeenCalledWith(textToCopy),
      );
    });

    it("should display the confirmation text", async () => {
      const confirmationText = getRandomString();
      const { testId } = renderCopyButton({ confirmationText });
      clickCopyButton(testId);
      await waitFor(() =>
        expect(copyButtonByText(confirmationText)).toBeInTheDocument(),
      );
    });

    describe("and waiting for 3 seconds", () => {
      it("should reset the display text back to original", async () => {
        vi.useFakeTimers();

        const text = getRandomString();
        const confirmationText = getRandomString();
        const { testId } = renderCopyButton({ text, confirmationText });

        await act(async () => {
          clickCopyButton(testId);
          await mockWriteText();
        });

        expect(copyButtonByText(confirmationText)).toBeInTheDocument();
        await act(async () => {
          await vi.advanceTimersByTimeAsync(3000);
        });

        expect(copyButtonByText(text)).toBeInTheDocument();

        vi.useRealTimers();
      });
    });
  });

  describe("and configuring checkmark visibility", () => {
    describe("and showCheckmark is false", () => {
      it("should not display the checkmark", async () => {
        const { testId } = renderCopyButton({ showCheckmark: false });
        await act(async () => {
          clickCopyButton(testId);
        });
        expect(checkmark()).not.toBeInTheDocument();
      });
    });

    describe("and showCheckmark is true", () => {
      it("should display the checkmark when confirmation text is shown", async () => {
        const text = getRandomString();
        const { testId } = renderCopyButton({ text, showCheckmark: true });

        clickCopyButton(testId);

        await waitFor(() => {
          expect(copyButtonByText(text)).toBeInTheDocument();
        });

        expect(checkmark()).toBeInTheDocument();
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

              renderCopyButton({
                text,
                confirmationText,
                showCheckmark: showCheckmark,
              });

              const buttonBefore = copyButtonByText(text);
              const initialWidth = buttonBefore.getBoundingClientRect().width;

              await act(async () => {
                fireEvent.click(buttonBefore);
              });

              const buttonDuringCopied = copyButtonByText(confirmationText);
              const widthDuringCopied =
                buttonDuringCopied.getBoundingClientRect().width;

              await act(async () => {
                await vi.advanceTimersByTimeAsync(3000);
              });

              const buttonAfter = copyButtonByText(text);
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
        const { testId } = renderCopyButton({
          showCheckmark: true,
          appearance: type,
        });

        clickCopyButton(testId);

        await waitFor(() => {
          expect(checkmark()).toBeInTheDocument();
          expect(Array.from(checkmark()?.classList ?? []).join(", ")).toContain(
            expectedClass,
          );
        });
      });
    });
  });

  describe("and handling multiple interactions", () => {
    it("should handle multiple rapid clicks correctly", async () => {
      vi.useFakeTimers();

      const textToCopy = getRandomString();
      const { testId } = renderCopyButton({ textToCopy });

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          clickCopyButton(testId);
          await vi.advanceTimersByTimeAsync(100);
        });
      }

      expect(mockWriteText).toHaveBeenCalledExactlyOnceWith(textToCopy);
      vi.useRealTimers();
    });

    it("should cleanup timeouts on unmount", async () => {
      vi.useFakeTimers();

      const text = getRandomString();
      const confirmationText = getRandomString();
      const { testId, unmount } = renderCopyButton({ text, confirmationText });

      await act(async () => {
        clickCopyButton(testId);
        await mockWriteText();
      });
      expect(copyButtonByText(confirmationText)).toBeInTheDocument();

      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });

      expect(screen.queryByText(text)).not.toBeInTheDocument();
      expect(screen.queryByText(confirmationText)).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
