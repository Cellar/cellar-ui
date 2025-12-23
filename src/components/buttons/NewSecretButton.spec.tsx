import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NewSecretButton } from "./NewSecretButton";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("NewSecretButton component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe("when rendering", () => {
    it("should display New Secret text", () => {
      render(
        <BrowserRouter>
          <NewSecretButton />
        </BrowserRouter>,
      );
      expect(screen.getByText("New Secret")).toBeInTheDocument();
    });

    it("should render a Lock icon", () => {
      const { container } = render(
        <BrowserRouter>
          <NewSecretButton />
        </BrowserRouter>,
      );
      const lock = container.querySelector("#secret-create-lock");
      expect(lock).toBeInTheDocument();
    });

    describe("and clicking the button", () => {
      it("should navigate to /secret/create", async () => {
        const user = userEvent.setup();
        render(
          <BrowserRouter>
            <NewSecretButton />
          </BrowserRouter>,
        );
        const button = screen.getByText("New Secret");
        await user.click(button);
        expect(mockNavigate).toHaveBeenCalledWith("/secret/create");
      });
    });
  });
});
