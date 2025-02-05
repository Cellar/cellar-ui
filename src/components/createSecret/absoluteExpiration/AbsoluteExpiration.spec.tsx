import { fireEvent, render } from "@testing-library/react";
import { describe, test, vi } from "vitest";
import { AbsoluteExpiration } from "./AbsoluteExpiration";
import { form } from "./AbsoluteExpiration.spec.model";

describe("AbsoluteExpiration Component", () => {
  test("renders the component with default values", () => {
    const setExpirationMock = vi.fn();

    render(
      <AbsoluteExpiration
        expiration={new Date()}
        setExpiration={setExpirationMock}
        className="test-class"
      />,
    );

    expect(form.expirationAbsoluteButton).toBeInTheDocument();
    expect(form.expirationDate).toBeInTheDocument();
    expect(form.expirationTime).toBeInTheDocument();
    expect(form.expirationAmPm).toBeInTheDocument();
  });

  test("calls setExpiration when date input is changed", () => {
    const setExpirationMock = vi.fn();
    const dummyDate = new Date();
    dummyDate.setDate(dummyDate.getDate() + 1);
    const formattedDate = `${dummyDate.getFullYear()}-${String(
      dummyDate.getMonth(),
    ).padStart(2, "0")}-${String(dummyDate.getDate()).padStart(2, "0")}`;

    render(
      <AbsoluteExpiration
        expiration={new Date()}
        setExpiration={setExpirationMock}
        className="test-class"
      />,
    );

    fireEvent.change(form.expirationDate, { target: { value: formattedDate } });
    expect(setExpirationMock).toHaveBeenCalled();
  });

  test("calls setExpiration when time input is changed", () => {
    const setExpirationMock = vi.fn();

    render(
      <AbsoluteExpiration
        expiration={new Date()}
        setExpiration={setExpirationMock}
        className="test-class"
      />,
    );

    fireEvent.change(form.expirationTime, { target: { value: "03:30" } });
    expect(setExpirationMock).toHaveBeenCalled();
  });

  test("calls setExpiration when am/pm input is changed", () => {
    const setExpirationMock = vi.fn();

    render(
      <AbsoluteExpiration
        expiration={new Date()}
        setExpiration={setExpirationMock}
        className="test-class"
      />,
    );

    fireEvent.change(form.expirationAmPm, { target: { value: "PM" } });
    expect(setExpirationMock).toHaveBeenCalled();
  });
});
