import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

export const form = {
  get expirationRelativeButton() {
    return screen.getByTestId("expiration-relative-button");
  },

  get hoursInput() {
    return screen.getByTestId("relative-expiration-hours");
  },

  get minutesInput() {
    return screen.getByTestId("relative-expiration-minutes");
  },
};

/**
 * Updates the hours and minutes inputs in the RelativeExpiration component.
 * @param {number} hours - The number of hours to set.
 * @param {number} minutes - The number of minutes to set.
 */
export async function setRelativeExpiration(hours: number, minutes: number) {
  const hoursInput = form.hoursInput;
  await userEvent.clear(hoursInput);
  await userEvent.type(hoursInput, String(hours));

  const minutesInput = form.minutesInput;
  await userEvent.clear(minutesInput);
  await userEvent.type(minutesInput, String(minutes));
}
