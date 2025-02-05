import { screen } from "@testing-library/react";

export const form = {
  get self() {
    return screen.getByTestId("access-secret-form");
  },

  get secretContentInput() {
    return screen.getByTestId("secret-content");
  },

  get copyButton() {
    return screen.getByTestId("copy-secret-button");
  },
};
