import React, {
  ComponentPropsWithoutRef,
  FC,
  useEffect,
  useRef,
  useState,
} from "react";
import { Checkmark } from "src/components/characters/Checkmark";
import { Button } from "src/components/Button";
import classes from "src/components/CopyButton.module.css";

interface CopyButtonProps extends ComponentPropsWithoutRef<"a"> {
  appearance?: string;
  textToCopy: string;
  text?: string;
  confirmationText?: string;
  showCheckmark?: boolean;
}

export const CopyButton: FC<CopyButtonProps> = ({
  textToCopy,
  appearance,
  text = "Copy",
  confirmationText = "Copied",
  showCheckmark = true,
  id,
  ...props
}) => {
  const [displayText, setDisplayText] = useState(text);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [extraContentWidth, setExtraContentWidth] = useState(0);

  const checkMarkId = `${id}-checkmark`;

  function getCheckMarkWidth(): number {
    if (!showCheckmark) return 0;

    const checkMark = document.getElementById(checkMarkId);
    if (checkMark) {
      const checkMarkStyles = window.getComputedStyle(checkMark);
      return +checkMarkStyles.width.split("px")[0];
    }
    return 0;
  }

  function getGapWidth(): number {
    if (contentRef.current)
      return parseInt(getComputedStyle(contentRef.current).gap) || 8;
    return 8;
  }

  useEffect(() => {
    setExtraContentWidth(
      showCheckmark ? getGapWidth() + getCheckMarkWidth() : 0,
    );
  }, [showCheckmark]);

  const handleClick = async () => {
    await navigator.clipboard.writeText(textToCopy);
    setDisplayText(confirmationText);
    setTimeout(() => {
      setDisplayText(text);
    }, 5000);
  };

  return (
    <Button
      appearance={appearance}
      textstates={[text, confirmationText]}
      onClick={handleClick}
      extracontentwidth={extraContentWidth}
      {...props}
    >
      <span className={classes.buttonContent}>
        {displayText}
        {showCheckmark && displayText === confirmationText && (
          <Checkmark
            id={checkMarkId}
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
      </span>
    </Button>
  );
};
