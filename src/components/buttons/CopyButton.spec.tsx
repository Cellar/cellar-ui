import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CopyButton } from "./CopyButton";

describe("CopyButton", () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: mockWriteText,
      },
    });
  });

  it("renders the button with the correct initial text", () => {
    render(<CopyButton textToCopy="Hello, World!" text="Copy" />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("copies the text to the clipboard when clicked", async () => {
    render(<CopyButton textToCopy="Hello, World!" text="Copy" />);
    fireEvent.click(screen.getByText("Copy"));
    await waitFor(() =>
      expect(mockWriteText).toHaveBeenCalledWith("Hello, World!"),
    );
  });

  it("displays the confirmation text after copying", async () => {
    render(
      <CopyButton
        textToCopy="Hello, World!"
        text="Copy"
        confirmationText="Copied"
      />,
    );
    fireEvent.click(screen.getByText("Copy"));
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });

  it("resets the display text back to the original after 3 seconds", async () => {
    vi.useFakeTimers();

    const clipboardWriteMock = vi.fn(() => Promise.resolve());
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteMock,
      },
    });
    render(
      <CopyButton
        textToCopy="Hello, World!"
        text="Copy"
        confirmationText="Copied"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Copy"));
      await clipboardWriteMock();
    });

    expect(screen.getByText("Copied")).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(screen.getByText("Copy")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("does not display the checkmark if 'showCheckmark' is false", () => {
    render(
      <CopyButton
        textToCopy="Hello, World!"
        text="Copy"
        showCheckmark={false}
      />,
    );
    fireEvent.click(screen.getByText("Copy"));
    expect(screen.queryByTestId(/checkmark/i)).not.toBeInTheDocument();
  });

  it("displays the checkmark when 'showCheckmark' is true and confirmation text is shown", async () => {
    render(
      <CopyButton
        id="test-button"
        textToCopy="Hello, World!"
        text="Copy"
        confirmationText="Copied"
        showCheckmark={true}
      />,
    );

    fireEvent.click(screen.getByText("Copy"));

    await waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument();
      expect(
        document.getElementById("test-button-checkmark"),
      ).toBeInTheDocument();
    });
  });
});
