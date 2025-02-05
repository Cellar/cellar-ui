import React, { useState } from "react";

import Button from "../Button";
import {
  Form,
  FormButton,
  TextArea,
  NumericInput,
  ToggleButton,
} from "../Form";

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

export const CreateSecretForm = () => {
  const [secretContent, setSecretContent] = useState("");
  const [expirationMode, setExpirationMode] = useState(
    ExpirationModes.Relative,
  );
  const [accessLimit, setAccessLimit] = useState(1);
  const [accessLimitDisabled, setAccessLimitDisabled] = useState(false);

  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const now = new Date();
  const inTwentyFourHours = new Date();
  inTwentyFourHours.setHours(now.getHours() + 24, now.getMinutes(), 0, 0);
  const [expirationDate, setExpirationDate] = useState(inTwentyFourHours);

  function handleSetAccessLimit(newLimit: number) {
    if (newLimit > 0) setAccessLimit(newLimit);
  }

  async function handleCreateSecret() {
    const metadata = await createSecret(
      secretContent,
      expirationDate,
      accessLimitDisabled ? -1 : accessLimit,
    );
    navigate(`/secret/${(metadata as ISecretMetadata).id}`);
  }

  return (
    <div>
      <Form>
        <TextArea
          data-testid="secret-content"
          rows={isMobile ? 13 : 14}
          placeholder="Enter Secret Content"
          onChange={(e) => setSecretContent(e.target.value)}
          required
        />
        <div className={cx(classes.formControls, classes.formSection)}>
          <div>
            <span className={classes.header}>Expiration</span>
            <div>
              {expirationMode === ExpirationModes.Relative && (
                <>
                  <button
                    data-testid="expiration-absolute-option"
                    className={classes.expirationModeOption}
                    onClick={() => setExpirationMode(ExpirationModes.Absolute)}
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
                    onClick={() => setExpirationMode(ExpirationModes.Relative)}
                  >
                    {ExpirationModes.Relative}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className={classes.accessLimitSection}>
            <span className={classes.header}>Access Limit</span>
            <div className={classes.accessLimitElements}>
              <NumericInput
                data-testid="access-limit-input"
                value={accessLimit}
                className={classes.accessLimitInput}
                onChange={(e) => handleSetAccessLimit(+e.target.value)}
              />
              <FormButton
                data-testid="access-limit-decrement-button"
                className={classes.accessLimitInputModifier}
                onClick={() => handleSetAccessLimit(accessLimit - 1)}
              >
                -
              </FormButton>
              <FormButton
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
          </div>
        </div>
        <div className={classes.formSection}>
          <Button
            disabled={secretContent.length <= 0}
            data-testid="create-secret-button"
            appearance={Button.appearances.primary}
            data-text="Create Secret"
            onClick={secretContent.length <= 0 ? undefined : handleCreateSecret}
          >
            Create Secret
          </Button>
        </div>
      </Form>
    </div>
  );
};
