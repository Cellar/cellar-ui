import { fireEvent, screen, waitFor } from "@testing-library/react";
import { formatDateForParsing } from "@tests/helpers";
import { expect } from "vitest";

export const form = {
  get expirationAbsoluteButton() {
    return screen.getByTestId("expiration-absolute-date");
  },
  get expirationDate(): HTMLInputElement {
    return screen.getByTestId("expiration-absolute-date");
  },
  get expirationTime(): HTMLSelectElement {
    return screen.getByTestId("expiration-absolute-time");
  },
  get expirationAmPm() {
    return screen.getByTestId("expiration-absolute-ampm");
  },
};

export async function setAbsoluteExpiration(
  year: number,
  month: number,
  day: number,
  hour:
    | "01"
    | "02"
    | "03"
    | "04"
    | "05"
    | "06"
    | "07"
    | "08"
    | "09"
    | "10"
    | "11"
    | "12",
  minute: "00" | "30",
  ampm: "AM" | "PM",
) {
  const date = new Date(year, month - 1, day, 0, 0);
  const newDate = formatDateForParsing(date);
  const newTime = `${hour}:${minute}`;
  const newAmPm = ampm;

  fireEvent.change(form.expirationDate, { target: { value: newDate } });
  fireEvent.change(form.expirationTime, { target: { value: newTime } });
  fireEvent.change(form.expirationAmPm, { target: { value: newAmPm } });

  await waitFor(() => {
    expect(form.expirationDate).toHaveValue(newDate);
    expect(form.expirationTime).toHaveValue(newTime);
    expect(form.expirationAmPm).toHaveValue(newAmPm);
  });
}
