import React, { FC, useEffect, useRef, useState } from "react";
import { Checkmark } from "src/components/characters/Checkmark";
import { Button, ButtonProps } from "src/components/Button";
import classes from "src/components/CopyButton.module.css";

interface CopyButtonProps extends ButtonProps {
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
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);
  const isPrimary = appearance === Button.appearances.primary;

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

      if (isPrimary) {
        spacedTextSpan.style.letterSpacing = "2px";
      }

      const maxWidth = Math.max(
        textSpan.offsetWidth,
        confirmationSpan.offsetWidth,
        isPrimary ? spacedTextSpan.offsetWidth : 0,
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
    setContentWidth(
      getMaxContentWidth() +
        (showCheckmark ? getGapWidth() : 0) +
        getCheckMarkWidth(),
    );
  }, [text, confirmationText, showCheckmark]);

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
      onMouseEnter={() => isPrimary && setIsHovered(true)}
      onMouseLeave={() => isPrimary && setIsHovered(false)}
    >
      <span
        ref={contentRef}
        className={classes.buttonContent}
        style={{
          width: contentWidth ? `${contentWidth}px` : undefined,
          letterSpacing: isPrimary && isHovered ? "4px" : "normal",
          transition: isPrimary ? "letter-spacing 1s ease" : undefined,
        }}
      >
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
