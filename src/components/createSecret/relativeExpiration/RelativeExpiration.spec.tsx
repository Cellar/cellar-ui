import { fireEvent, render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { RelativeExpiration } from "./RelativeExpiration";
import { form } from "./RelativeExpiration.spec.model";
import dayjs from "dayjs";

describe("RelativeExpiration", () => {
  it("should render hours and minutes input fields", () => {
    render(
      <RelativeExpiration expiration={new Date()} setExpiration={vi.fn()} />,
    );

    expect(form.hoursInput).toBeInTheDocument();
    expect(form.minutesInput).toBeInTheDocument();
  });

  it("should display correct initial values based on expiration", () => {
    const expirationDate = new Date();
    expirationDate.setHours(
      new Date().getHours() + 2,
      new Date().getMinutes() + 15,
    );

    render(
      <RelativeExpiration
        expiration={expirationDate}
        setExpiration={vi.fn()}
      />,
    );

    expect(form.hoursInput).toHaveValue(2);
    expect(form.minutesInput).toHaveValue(15);
  });

  it("should update the expiration date when hours input changes", () => {
    const setExpirationMock = vi.fn();
    render(
      <RelativeExpiration
        expiration={new Date()}
        setExpiration={setExpirationMock}
      />,
    );

    fireEvent.change(form.hoursInput, { target: { value: "5" } });

    expect(setExpirationMock).toHaveBeenCalled();
    const updatedDate = setExpirationMock.mock.calls[0][0];
    expect(dayjs(updatedDate).hour()).toBe((new Date().getHours() + 5) % 24);
  });

  it("should update the expiration date when minutes input changes", () => {
    const setExpirationMock = vi.fn();
    render(
      <RelativeExpiration
        expiration={new Date()}
        setExpiration={setExpirationMock}
      />,
    );

    fireEvent.change(form.minutesInput, { target: { value: "45" } });

    expect(setExpirationMock).toHaveBeenCalled();
    const updatedDate = setExpirationMock.mock.calls[0][0];
    expect(dayjs(updatedDate).minute()).toBe(
      (new Date().getMinutes() + 45) % 60,
    );
  });
});
