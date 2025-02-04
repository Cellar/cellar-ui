import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

export const form = {
  get createButton() {
    return screen.getByTestId("create-secret-button");
  },
  get increaseAccessLimitButton() {
    return screen.getByTestId("access-limit-increment-button");
  },
  get decreaseAccessLimitButton() {
    return screen.getByTestId("access-limit-decrement-button");
  },

  get secretContentInput() {
    return screen.getByTestId("secret-content");
  },
  get accessLimitInput() {
    return screen.getByTestId("access-limit-input");
  },

  get noLimitToggle() {
    return screen.getByTestId("no-limit-toggle");
  },

  get absoluteExpirationOption() {
    return screen.getByTestId("expiration-absolute-option");
  },
  get absoluteExpirationButton() {
    return screen.getByTestId("expiration-absolute-button");
  },
  get relativeExpirationOption() {
    return screen.getByTestId("expiration-relative-option");
  },
  get relativeExpirationButton() {
    return screen.getByTestId("expiration-relative-button");
  },
};

export async function setExpirationMode(mode: "absolute" | "relative") {
  let clickOption: HTMLElement;
  let expectedButton: () => HTMLElement;
  let expectedOption: () => HTMLElement;

  switch (mode) {
    case "absolute":
      clickOption = form.absoluteExpirationOption;
      expectedButton = () => form.absoluteExpirationButton;
      expectedOption = () => form.relativeExpirationOption;
      break;
    case "relative":
      clickOption = form.relativeExpirationOption;
      expectedButton = () => form.relativeExpirationButton;
      expectedOption = () => form.absoluteExpirationOption;
      break;
  }

  await userEvent.click(clickOption);
  await waitFor(() => {
    expect(expectedButton()).toBeInTheDocument();
    expect(expectedOption()).toBeInTheDocument();
  });
}

export async function adjustAccessLimit(direction: "+" | "-", times: number) {
  let button: HTMLElement;
  switch (direction) {
    case "+":
      button = form.increaseAccessLimitButton;
      break;
    case "-":
      button = form.decreaseAccessLimitButton;
      break;
  }

  for (let i = 0; i < times; i++) {
    await userEvent.click(button);
  }
}
