import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";
import { getRandomString } from "@tests/helpers";

function renderButton({
  appearance = Button.appearances.primary,
  text = "Click me",
  ...props
}): { testId: string; unmount: () => void } {
  const id = `test-button-${getRandomString()}`;
  const { unmount } = render(
    <Button id={id} data-testid={id} appearance={appearance} {...props}>
      {text}
    </Button>,
  );
  return { testId: id, unmount };
}

function clickButton(testId: string) {
  fireEvent.click(screen.getByTestId(testId));
}

const buttonByText = (text: string) => screen.getByText(text);

describe("When rendering Button", () => {
  describe("and initially displaying the button", () => {
    it("should show the correct text", () => {
      const text = getRandomString();
      renderButton({ text });
      expect(buttonByText(text)).toBeInTheDocument();
    });

    Object.entries(Button.appearances).forEach(([name, appearance]) => {
      describe(`and appearance is ${name}`, () => {
        it(`should apply ${name} appearance class`, () => {
          const { testId } = renderButton({ appearance });
          const button = screen.getByTestId(testId);
          expect(Array.from(button.classList).join(", ")).toContain(name);
        });
      });
    });
  });

  describe("and handling hover states", () => {
    it("should set letter spacing on hover for primary button", async () => {
      const { testId } = renderButton({
        appearance: Button.appearances.primary,
      });
      const button = screen.getByTestId(testId);

      await act(async () => {
        fireEvent.mouseEnter(button);
      });

      expect(button.style.letterSpacing).toBe("4px");

      await act(async () => {
        fireEvent.mouseLeave(button);
      });

      expect(button.style.letterSpacing).toBe("normal");
    });
  });

  describe("and measuring button dimensions", () => {
    const testScenarios = [
      {
        name: "and first state is longest",
        states: ["long text", "short"],
      },
      {
        name: "and second state is longest",
        states: ["short", "long text"],
      },
    ];

    testScenarios.forEach(({ name, states }) => {
      describe(name, () => {
        Object.entries(Button.appearances).forEach(
          ([appearanceName, appearance]) => {
            describe(`and appearance is ${appearanceName}`, () => {
              it("should maintain the same width through all states", async () => {
                vi.useFakeTimers();

                renderButton({
                  appearance,
                  textstates: states,
                  text: states[0],
                });

                const button = buttonByText(states[0]);
                const initialWidth = button.getBoundingClientRect().width;

                await act(async () => {
                  fireEvent.mouseEnter(button);
                  vi.runAllTimers();
                });

                const widthDuringHover = button.getBoundingClientRect().width;

                await act(async () => {
                  fireEvent.mouseLeave(button);
                  vi.runAllTimers();
                });

                const finalWidth = button.getBoundingClientRect().width;

                expect(widthDuringHover).toBe(initialWidth);
                expect(finalWidth).toBe(initialWidth);

                vi.useRealTimers();
              });
            });
          },
        );
      });
    });
  });

  describe("and handling click events", () => {
    it("should call onClick handler when clicked", () => {
      const handleClick = vi.fn();
      const { testId } = renderButton({ onClick: handleClick });

      clickButton(testId);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
