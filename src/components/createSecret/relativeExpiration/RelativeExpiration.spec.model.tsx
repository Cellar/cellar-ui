import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect } from "vitest";

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
export async function setRelativeExpiration(hours: string, minutes: string) {
  fireEvent.change(form.hoursInput, { target: { value: hours } });
  fireEvent.change(form.minutesInput, { target: { value: minutes } });

  await waitFor(() => {
    expect(form.hoursInput).toHaveValue(+hours);
    expect(form.minutesInput).toHaveValue(+minutes);
  });
}
