import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";
import { CreateSecretForm } from "./CreateSecretForm";
import { userEvent } from "@testing-library/user-event";
import { getSecretContent, renderWithRouter } from "@tests/helpers";
import { ISecretMetadata } from "@/models/secretMetadata";
import {
  form,
  setExpirationMode,
  adjustAccessLimit,
  setAccessLimit,
} from "./CreateSecretForm.spec.model";
import { setRelativeExpiration } from "@/components/createSecret/relativeExpiration/RelativeExpiration.spec.model";
import { setAbsoluteExpiration } from "@/components/createSecret/absoluteExpiration/AbsoluteExpiration.spec.model";
import { createSecretWithText, createSecretWithFile } from "@/api/client";

const mockMetadata: ISecretMetadata = {
  id: "V5nIvLMxZUYP4",
  access_count: 0,
  access_limit: 5,
  expiration: new Date(),
};

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => navigateMock),
  };
});

describe("When rendering CreateSecretForm", () => {
  beforeAll(() => {
    vi.mock("@/api/client");
    createSecretWithText.mockResolvedValue(mockMetadata);
    createSecretWithFile.mockResolvedValue(mockMetadata);
  });

  beforeEach(() => {
    vi.clearAllMocks();

    renderWithRouter(<CreateSecretForm />, { testId: "secret-content" }, [
      `/secret/${mockMetadata.id}`,
    ]);
  });

  describe("and making no changes", () => {
    it("should display secret content input field", () => {
      expect(form.secretContentInput).toBeInTheDocument();
    });

    it("should display absolute expiration option", () => {
      expect(form.absoluteExpirationOption).toBeInTheDocument();
    });

    it("should display relative expiration inputs", () => {
      expect(
        form.relativeExpirationModel.expirationRelativeButton,
      ).toBeInTheDocument();
    });
  });

  describe("and modifying the secret content", () => {
    it("should allow typing in the secret content field", async () => {
      await userEvent.type(form.secretContentInput, "This is a secret");

      expect(form.secretContentInput).toHaveValue("This is a secret");
    });
  });

  describe("and setting expiration to absolute", () => {
    beforeEach(async () => {
      await setExpirationMode("absolute");
    });

    it("should display absolute expiration date input field", () => {
      expect(form.absoluteExpirationModel.expirationDate).toBeInTheDocument();
    });

    it("should display absolute expiration time input field", () => {
      expect(form.absoluteExpirationModel.expirationTime).toBeInTheDocument();
    });

    it("should display absolute expiration ampm input field", () => {
      expect(form.absoluteExpirationModel.expirationAmPm).toBeInTheDocument();
    });
  });

  describe("and setting expiration to relative", () => {
    it("should display relative expiration hours input field", () => {
      expect(form.relativeExpirationModel.hoursInput).toBeInTheDocument();
    });

    it("should display relative expiration minutes input field", () => {
      expect(form.relativeExpirationModel.minutesInput).toBeInTheDocument();
    });
  });

  describe("and modifying the access limit", () => {
    it("should increment access limit", async () => {
      await adjustAccessLimit("+", 3);
      expect(form.accessLimitInput).toHaveValue("4");
    });

    it("should decrement access limit", async () => {
      await adjustAccessLimit("+", 4);
      await adjustAccessLimit("-", 2);
      expect(form.accessLimitInput).toHaveValue("3");
    });

    it("should allow typing into access limit", async () => {
      await setAccessLimit(7);
      expect(form.accessLimitInput).toHaveValue("7");
    });

    describe("and disabling access limit", () => {
      it("should toggle access limit to 'No Limit'", async () => {
        await userEvent.click(form.noLimitToggle);

        expect(form.noLimitToggle.className).toMatch(/toggled/);
      });

      it("should empty access limit input value", async () => {
        await userEvent.click(form.noLimitToggle);

        expect(form.accessLimitInput).toHaveValue("");
      });

      it("should disable access limit input", async () => {
        await userEvent.click(form.noLimitToggle);

        expect(form.accessLimitInput).toBeDisabled();
      });

      it("should disable increment access limit button", async () => {
        await userEvent.click(form.noLimitToggle);

        expect(form.increaseAccessLimitButton).toBeDisabled();
      });

      it("should disable decrement access limit button", async () => {
        await userEvent.click(form.noLimitToggle);

        expect(form.decreaseAccessLimitButton).toBeDisabled();
      });
    });
  });

  describe("and creating secret with all inputs filled out correctly", () => {
    function* getRelativeTestParams(): Generator<{
      content: string;
      accessLimit: number;
      hours:
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
        | "12";
      minutes: "00" | "30";
    }> {
      const content = getSecretContent();
      for (const accessLimit of [3, -1]) {
        yield {
          content,
          accessLimit,
          hours: "10",
          minutes: "30",
        };
      }
    }

    describe("and setting expiration to relative", () => {
      for (const testParams of getRelativeTestParams()) {
        describe(`and access limit to ${testParams.accessLimit}`, () => {
          describe(`and hour is ${testParams.hours} and minutes is ${testParams.minutes}`, () => {
            beforeEach(async () => {
              vi.clearAllMocks();

              await userEvent.type(form.secretContentInput, testParams.content);

              await setRelativeExpiration(testParams.hours, testParams.minutes);

              await setAccessLimit(testParams.accessLimit);

              await userEvent.click(form.createButton);
            });

            it("should navigate to the secret details page", async () => {
              await waitFor(() => {
                expect(navigateMock).toHaveBeenCalledExactlyOnceWith(
                  `/secret/${mockMetadata.id}`,
                );
              });
            });

            it("should call 'createSecret' with correct parameters", async () => {
              const expectedExpiration = new Date();
              expectedExpiration.setHours(
                expectedExpiration.getHours() + +testParams.hours,
                expectedExpiration.getMinutes() + +testParams.minutes,
                0,
                0,
              );
              await waitFor(() => {
                expect(createSecretWithText).toHaveBeenCalledExactlyOnceWith(
                  testParams.content,
                  expectedExpiration,
                  testParams.accessLimit,
                );
              });
            });
          });
        });
      }
    });

    function* getAbsoluteTestParams(): Generator<{
      content: string;
      accessLimit: number;
      year: number;
      month: number;
      day: number;
      hours:
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
        | "12";
      minutes: "00" | "30";
      ampm: "AM" | "PM";
    }> {
      const content = getSecretContent();
      for (const accessLimit of [3, -1]) {
        const now = new Date();
        for (const ampm of ["AM", "PM"] as const) {
          yield {
            content,
            accessLimit,
            year: now.getFullYear() + 1,
            month: 1,
            day: 1,
            hours: "10",
            minutes: "30",
            ampm: ampm,
          };
        }
      }
    }

    describe("and setting expiration to absolute", () => {
      for (const testParams of getAbsoluteTestParams()) {
        describe(`and access limit to ${testParams.accessLimit}`, () => {
          describe(`and date/time is ${testParams.year}-${testParams.month}-${testParams.day} ${testParams.hours}:${testParams.minutes} ${testParams.ampm}`, () => {
            beforeEach(async () => {
              vi.clearAllMocks();
              await userEvent.type(form.secretContentInput, testParams.content);

              await setExpirationMode("absolute");
              await setAbsoluteExpiration(
                testParams.year,
                testParams.month,
                testParams.day,
                testParams.hours,
                testParams.minutes,
                testParams.ampm,
              );

              await setAccessLimit(testParams.accessLimit);

              await userEvent.click(form.createButton);
            });

            it("should navigate to the secret details page", async () => {
              await waitFor(() => {
                expect(navigateMock).toHaveBeenCalledExactlyOnceWith(
                  `/secret/${mockMetadata.id}`,
                );
              });
            });

            it("should call 'createSecret' with correct parameters", async () => {
              const expectedExpiration = new Date(
                testParams.year,
                testParams.month - 1,
                testParams.day,
                testParams.ampm == "AM"
                  ? +testParams.hours
                  : +testParams.hours + 12,
                +testParams.minutes,
                0,
                0,
              );
              await waitFor(() => {
                expect(createSecretWithText).toHaveBeenCalledExactlyOnceWith(
                  testParams.content,
                  expectedExpiration,
                  testParams.accessLimit,
                );
              });
            });
          });
        });
      }
    });
  });

  describe("and switching content type", () => {
    it("should display content type toggle", () => {
      expect(form.contentTypeToggle).toBeInTheDocument();
    });

    it("should default to text mode", () => {
      expect(form.textContentTypeButton.className).toMatch(/active/);
    });

    it("should display textarea in text mode", () => {
      expect(form.secretContentInput).toBeInTheDocument();
    });

    it("should not display file upload zone in text mode", () => {
      expect(form.fileUploadZone).not.toBeInTheDocument();
    });

    describe("and switching to file mode", () => {
      beforeEach(async () => {
        await userEvent.click(form.fileContentTypeButton);
      });

      it("should activate file mode button", () => {
        expect(form.fileContentTypeButton.className).toMatch(/active/);
      });

      it("should deactivate text mode button", () => {
        expect(form.textContentTypeButton.className).not.toMatch(/active/);
      });

      it("should hide textarea", () => {
        expect(form.secretContentInputQuery).not.toBeInTheDocument();
      });

      it("should display file upload zone", () => {
        expect(form.fileUploadZone).toBeInTheDocument();
      });
    });
  });

  describe("and uploading a file", () => {
    const testFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    beforeEach(async () => {
      await userEvent.click(form.fileContentTypeButton);
    });

    it("should display selected file name", async () => {
      await form.selectFile(testFile);
      expect(form.selectedFileName).toHaveTextContent("test.txt");
    });

    it("should display selected file size", async () => {
      await form.selectFile(testFile);
      expect(form.selectedFileSize).toHaveTextContent("12 Bytes");
    });

    it("should allow removing selected file", async () => {
      await form.selectFile(testFile);
      await userEvent.click(form.removeFileButton);
      expect(form.selectedFileInfo).not.toBeInTheDocument();
    });

    describe("and creating secret with file", () => {
      beforeEach(async () => {
        vi.clearAllMocks();
        await form.selectFile(testFile);
        await setRelativeExpiration("10", "30");
        await setAccessLimit(3);
        await userEvent.click(form.createButton);
      });

      it("should navigate to the secret details page", async () => {
        await waitFor(() => {
          expect(navigateMock).toHaveBeenCalledExactlyOnceWith(
            `/secret/${mockMetadata.id}`,
          );
        });
      });

      it("should call createSecretWithFile with correct file", async () => {
        await waitFor(() => {
          expect(createSecretWithFile).toHaveBeenCalledWith(
            testFile,
            expect.any(Date),
            3,
          );
        });
      });

      it("should call createSecretWithFile with correct expiration", async () => {
        const expectedExpiration = new Date();
        expectedExpiration.setHours(
          expectedExpiration.getHours() + 10,
          expectedExpiration.getMinutes() + 30,
          0,
          0,
        );

        await waitFor(() => {
          const callArgs = createSecretWithFile.mock.calls[0];
          const actualExpiration = callArgs[1] as Date;
          expect(actualExpiration.getTime()).toBeCloseTo(
            expectedExpiration.getTime(),
            -3,
          );
        });
      });

      it("should call createSecretWithFile with correct access limit", async () => {
        await waitFor(() => {
          expect(createSecretWithFile).toHaveBeenCalledWith(
            expect.any(File),
            expect.any(Date),
            3,
          );
        });
      });
    });

    describe("and file exceeds size limit", () => {
      const largeFile = new File(
        [new ArrayBuffer(9 * 1024 * 1024)],
        "large.bin",
      );

      it("should display error for oversized file", async () => {
        await form.selectFile(largeFile);
        expect(form.fileUploadError).toBeInTheDocument();
      });

      it("should not allow creating secret with oversized file", async () => {
        await form.selectFile(largeFile);
        await userEvent.click(form.createButton);
        expect(createSecretWithFile).not.toHaveBeenCalled();
      });
    });

    describe("and file is empty", () => {
      const emptyFile = new File([], "empty.txt");

      it("should display error for empty file", async () => {
        await form.selectFile(emptyFile);
        expect(form.fileUploadError).toBeInTheDocument();
      });

      it("should not allow creating secret with empty file", async () => {
        await form.selectFile(emptyFile);
        await userEvent.click(form.createButton);
        expect(createSecretWithFile).not.toHaveBeenCalled();
      });
    });
  });

  describe("and inputs are not filled out correctly", () => {
    it("should display an error message when submitting an empty secret", async () => {
      await userEvent.clear(form.secretContentInput);
      await userEvent.click(form.createButton);
      await waitFor(() => {
        expect(form.secretContentError).toBeInTheDocument();
      });
    });

    it("should be unable to set access limit to a non-positive number", async () => {
      fireEvent.change(form.accessLimitInput, { target: { value: "-1" } });
      expect(+form.accessLimitInput.value).toBeGreaterThan(0);
    });

    it("should display an error when relative expiration is in 0 minutes", async () => {
      await userEvent.clear(form.relativeExpirationModel.hoursInput);
      await userEvent.type(form.relativeExpirationModel.hoursInput, "0");
      await userEvent.clear(form.relativeExpirationModel.minutesInput);
      await userEvent.type(form.relativeExpirationModel.minutesInput, "0");
      await userEvent.click(form.createButton);
      await waitFor(() => {
        expect(form.expirationError).toBeInTheDocument();
      });
    });
  });
});
