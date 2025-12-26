import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { form as absoluteExpirationForm } from "./absoluteExpiration/AbsoluteExpiration.spec.model";
import { form as relativeExpirationForm } from "./relativeExpiration/RelativeExpiration.spec.model";

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
  get secretContentInputQuery() {
    return screen.queryByTestId("secret-content");
  },
  get accessLimitInput(): HTMLInputElement {
    return screen.getByTestId("access-limit-input");
  },

  get noLimitToggle() {
    return screen.getByTestId("no-limit-toggle");
  },

  get absoluteExpirationOption() {
    return screen.getByTestId("expiration-absolute-option");
  },
  get relativeExpirationOption() {
    return screen.getByTestId("expiration-relative-option");
  },

  get secretContentError() {
    return screen.getByTestId("secret-content-error");
  },
  get expirationError() {
    return screen.getByTestId("expiration-error");
  },
  get accessLimitError() {
    return screen.getByTestId("access-limit-error");
  },

  get absoluteExpirationForm() {
    return screen.getByTestId("absolute-expiration");
  },
  get relativeExpirationForm() {
    return screen.getByTestId("relative-expiration");
  },

  get absoluteExpirationModel() {
    return absoluteExpirationForm;
  },
  get relativeExpirationModel() {
    return relativeExpirationForm;
  },

  get contentTypeToggle() {
    return screen.getByTestId("content-type-toggle");
  },
  get textContentTypeButton() {
    return screen.getByTestId("content-type-text");
  },
  get fileContentTypeButton() {
    return screen.getByTestId("content-type-file");
  },

  get fileUploadZone() {
    return screen.queryByTestId("file-upload-zone");
  },
  get selectedFileInfo() {
    return screen.queryByTestId("selected-file-info");
  },
  get selectedFileName() {
    return screen
      .getByTestId("selected-file-info")
      .querySelector("div:first-child");
  },
  get selectedFileSize() {
    return screen.getByTestId("selected-file-size");
  },
  get removeFileButton() {
    return screen.getByTestId("remove-file-button");
  },
  get fileUploadError() {
    return screen.getByTestId("file-upload-error");
  },

  async selectFile(file: File) {
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    await userEvent.upload(input, file);
  },
};

export async function setExpirationMode(mode: "absolute" | "relative") {
  let clickOption: HTMLElement;
  let expectedButton: () => HTMLElement;
  let expectedOption: () => HTMLElement;

  switch (mode) {
    case "absolute":
      clickOption = form.absoluteExpirationOption;
      expectedButton = () => absoluteExpirationForm.expirationAbsoluteButton;
      expectedOption = () => form.relativeExpirationOption;
      break;
    case "relative":
      clickOption = form.relativeExpirationOption;
      expectedButton = () => relativeExpirationForm.expirationRelativeButton;
      expectedOption = () => form.absoluteExpirationOption;
      break;
  }

  await userEvent.click(clickOption);
  await waitFor(() => {
    expect(expectedButton()).toBeInTheDocument();
    expect(expectedOption()).toBeInTheDocument();
  });
}

export async function setAccessLimit(limit: number) {
  if (limit > 0) {
    await userEvent.dblClick(form.accessLimitInput); // in order to highlight and replace current value
    await userEvent.keyboard(limit.toString());
  } else {
    await userEvent.click(form.noLimitToggle);
  }
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
