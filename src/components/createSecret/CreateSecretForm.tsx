import React, { useState } from "react";

import Button from "src/components/buttons/Button";
import {
  Form,
  FormButton,
  TextArea,
  NumericInput,
  ToggleButton,
  ErrorWrapper,
} from "src/components/form/Form";

import classes from "./CreateSecretForm.module.css";
import { RelativeExpiration } from "@/components/createSecret/relativeExpiration/RelativeExpiration";
import { AbsoluteExpiration } from "@/components/createSecret/absoluteExpiration/AbsoluteExpiration";
import { createSecret } from "@/api/client";
import { ISecretMetadata } from "@/models/secretMetadata";
import { useNavigate } from "react-router-dom";
import cx from "classnames";
import { useMediaQuery } from "@mantine/hooks";

const ExpirationModes = {
  Absolute: "Expire On (Absolute)",
  Relative: "Expire After (Relative)",
};

const FormInputs = {
  SecretContent: "Enter secret content",
  Expiration: "Set expiration at least 30 minutes in the future",
  AccessLimit: "Please select an option",
};

type FormErrors = {
  [key in keyof typeof FormInputs]: string;
};

export const CreateSecretForm: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = (props) => {
  const [secretContent, setSecretContent] = useState("");
  const [expirationMode, setExpirationMode] = useState(
    ExpirationModes.Relative,
  );
  const [accessLimit, setAccessLimit] = useState(1);
  const [accessLimitDisabled, setAccessLimitDisabled] = useState(false);
  const [errors, setErrors] = useState<FormErrors>();

  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const now = new Date();
  const inTwentyFourHours = new Date();
  inTwentyFourHours.setHours(now.getHours() + 24, now.getMinutes(), 0, 0);
  const [expirationDate, setExpirationDate] = useState(inTwentyFourHours);

  function handleSetAccessLimit(newLimit: number) {
    if (newLimit > 0) setAccessLimit(newLimit);
    else setAccessLimit(1);
  }

  async function handleFormSubmit() {
    if (!validate()) return;

    const metadata = await createSecret(
      secretContent,
      expirationDate,
      accessLimitDisabled ? -1 : accessLimit,
    );
    navigate(`/secret/${(metadata as ISecretMetadata).id}`);
  }

  function validate(): boolean {
    const newErrors = {
      SecretContent:
        secretContent.trim().length <= 0 ? FormInputs.SecretContent : "",
      Expiration:
        expirationDate < new Date(new Date().getTime() + 30 * 60 * 1000)
          ? FormInputs.Expiration
          : "",
      AccessLimit:
        accessLimitDisabled || (accessLimit > 0 && !isNaN(accessLimit))
          ? ""
          : FormInputs.AccessLimit,
    };
    setErrors(newErrors);

    return !Object.values(newErrors).some(
      (err: string) => err.trim().length > 0,
    );
  }

  return (
    <div {...props}>
      <Form noValidate onSubmit={(event) => event.preventDefault()}>
        <ErrorWrapper
          className={classes.errorIndent}
          message={errors?.SecretContent ?? ""}
          data-testid="secret-content-error"
        >
          <TextArea
            data-testid="secret-content"
            rows={isMobile ? 13 : 14}
            placeholder="Enter Secret Content"
            onChange={(e) => setSecretContent(e.target.value)}
            required
          />
        </ErrorWrapper>
        <div className={cx(classes.formControls, classes.formSection)}>
          <div>
            <span className={classes.header}>Expiration</span>
            <ErrorWrapper
              message={errors?.Expiration ?? ""}
              data-testid="expiration-error"
            >
              <div
                data-testid={
                  expirationMode === ExpirationModes.Relative
                    ? "relative-expiration"
                    : "absolute-expiration"
                }
              >
                {expirationMode === ExpirationModes.Relative && (
                  <>
                    <button
                      data-testid="expiration-absolute-option"
                      className={classes.expirationModeOption}
                      onClick={() =>
                        setExpirationMode(ExpirationModes.Absolute)
                      }
                    >
                      {ExpirationModes.Absolute}
                    </button>
                    <br />
                    <RelativeExpiration
                      expiration={expirationDate}
                      setExpiration={setExpirationDate}
                    />
                  </>
                )}
                {expirationMode === ExpirationModes.Absolute && (
                  <>
                    <AbsoluteExpiration
                      expiration={expirationDate}
                      setExpiration={setExpirationDate}
                    />
                    <br />
                    <button
                      data-testid="expiration-relative-option"
                      className={classes.expirationModeOption}
                      onClick={() =>
                        setExpirationMode(ExpirationModes.Relative)
                      }
                    >
                      {ExpirationModes.Relative}
                    </button>
                  </>
                )}
              </div>
            </ErrorWrapper>
          </div>
          <div className={classes.accessLimitSection}>
            <span className={classes.header}>Access Limit</span>
            <ErrorWrapper
              message={errors?.AccessLimit ?? ""}
              data-testid="access-limit-error"
            >
              <div className={classes.accessLimitElements}>
                <NumericInput
                  disabled={accessLimitDisabled}
                  data-testid="access-limit-input"
                  value={accessLimitDisabled ? "" : accessLimit}
                  className={classes.accessLimitInput}
                  onChange={(e) => handleSetAccessLimit(+e.target.value)}
                />
                <FormButton
                  disabled={accessLimitDisabled}
                  data-testid="access-limit-decrement-button"
                  className={classes.accessLimitInputModifier}
                  onClick={() => handleSetAccessLimit(accessLimit - 1)}
                >
                  -
                </FormButton>
                <FormButton
                  disabled={accessLimitDisabled}
                  data-testid="access-limit-increment-button"
                  className={classes.accessLimitInputModifier}
                  onClick={() => handleSetAccessLimit(accessLimit + 1)}
                >
                  +
                </FormButton>
                <p className={classes.orText}>or</p>
                <ToggleButton
                  data-testid="no-limit-toggle"
                  className={classes.noLimitInput}
                  setParentState={setAccessLimitDisabled}
                >
                  No Limit
                </ToggleButton>
                <div className={classes.shim} />
              </div>
            </ErrorWrapper>
          </div>
        </div>
        <div className={classes.formSection}>
          <Button
            data-testid="create-secret-button"
            appearance={Button.appearances.primary}
            textstates={["Create Secret"]}
            onClick={handleFormSubmit}
          >
            Create Secret
          </Button>
        </div>
      </Form>
    </div>
  );
};
