import { screen } from "@testing-library/react";

export const form = {
  get expirationAbsoluteButton() {
    return screen.getByTestId("expiration-absolute-date");
  },
  get expirationDate() {
    return screen.getByTestId("expiration-absolute-date");
  },
  get expirationTime() {
    return screen.getByTestId("expiration-absolute-time");
  },
  get expirationAmPm() {
    return screen.getByTestId("expiration-absolute-ampm");
  },
};
