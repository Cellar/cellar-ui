import React, { FC, useState } from "react";
import { Checkmark } from "src/components/characters/Checkmark";
import { Button, ButtonProps } from "src/components/Button";
import classes from "src/components/CopyButton.module.css";

interface CopyButtonProps extends ButtonProps {
  textToCopy: string;
  text?: string;
  confirmationText?: string;
}

export const CopyButton: FC<CopyButtonProps> = ({
  textToCopy,
  appearance,
  text = "Copy",
  confirmationText = "Copied",
  ...props
}) => {
  const [displayText, setDisplayText] = useState(text);

  const handleClick = async () => {
    await navigator.clipboard.writeText(textToCopy);
    setDisplayText(confirmationText);
    setTimeout(() => {
      setDisplayText(text);
    }, 10000);
  };

  return (
    <Button appearance={appearance} {...props} onClick={handleClick}>
      {displayText}{" "}
      {displayText === confirmationText && (
        <Checkmark
          className={(() => {
            switch (appearance) {
              case Button.appearances.primary:
                return classes.checkPrimary;
              case Button.appearances.secondary:
                return classes.checkSecondary;
              case Button.appearances.round:
                return classes.checkRound;
              default:
                return "";
            }
          })()}
        />
      )}
    </Button>
  );
};
