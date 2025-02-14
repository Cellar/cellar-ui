import React, { FC, useEffect, useRef, useState } from "react";
import { Checkmark } from "src/components/characters/Checkmark";
import { Button, ButtonProps } from "src/components/Button";
import classes from "src/components/CopyButton.module.css";

interface CopyButtonProps extends ButtonProps {
  textToCopy: string;
  text?: string;
  confirmationText?: string;
  useCheckmark?: boolean;
}

export const CopyButton: FC<CopyButtonProps> = ({
  textToCopy,
  appearance,
  text = "Copy",
  confirmationText = "Copied",
  id,
  useCheckmark = true,
  ...props
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);

  const checkMarkId = `${id}-checkmark`;

  function getCheckMarkWidth(): number {
    const checkMark = document.getElementById(checkMarkId);
    if (checkMark) {
      const checkMarkStyles = window.getComputedStyle(checkMark);
      return +checkMarkStyles.width.split("px")[0];
    }

    return 0;
  }

  function getMaxContentWidth(): number {
    if (contentRef.current) {
      const textSpan = document.createElement("span");
      const confirmationSpan = document.createElement("span");
      const spacedTextSpan = document.createElement("span");

      const styles = window.getComputedStyle(contentRef.current);
      [textSpan, confirmationSpan, spacedTextSpan].forEach((span) => {
        span.style.visibility = "hidden";
        span.style.position = "absolute";
        span.style.font = styles.font;
        span.style.padding = styles.padding;
        document.body.appendChild(span);
      });

      textSpan.textContent = text;
      confirmationSpan.textContent = confirmationText;
      spacedTextSpan.textContent = text;
      spacedTextSpan.style.letterSpacing = "4px"; // Same value as hover state

      const maxWidth = Math.max(
        textSpan.offsetWidth,
        confirmationSpan.offsetWidth,
        spacedTextSpan.offsetWidth,
      );

      textSpan.remove();
      confirmationSpan.remove();
      spacedTextSpan.remove();

      return maxWidth;
    }

    return 0;
  }

  function getGapWidth(): number {
    if (contentRef.current)
      return parseInt(getComputedStyle(contentRef.current).gap) || 8;

    return 8;
  }

  useEffect(() => {
    setContentWidth(getMaxContentWidth() + getGapWidth() + getCheckMarkWidth());
  }, [text, confirmationText]);

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
      {...props}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        ref={contentRef}
        className={classes.buttonContent}
        style={{
          width: contentWidth ? `${contentWidth}px` : undefined,
          letterSpacing: isHovered ? "4px" : "initial",
          transition: "letter-spacing 1s ease",
        }}
      >
        {displayText}
        {useCheckmark && displayText === confirmationText && (
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
