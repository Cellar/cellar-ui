import {
  ComponentPropsWithoutRef,
  FC,
  useEffect,
  useRef,
  useState,
} from "react";
import cx from "classnames";

import classes from "./Button.module.css";

export interface ButtonProps extends ComponentPropsWithoutRef<"a"> {
  appearance?: string;
  disabled?: boolean;
  textstates?: string[];
  extracontentwidth?: number;
}

interface Btn extends FC<ButtonProps> {
  appearances: {
    primary: string;
    secondary: string;
    round: string;
  };
}

const appearances = {
  primary: "primary",
  secondary: "secondary",
  round: "round",
};

export const Button: Btn = (props) => {
  const {
    appearance,
    disabled,
    textstates = [],
    extracontentwidth = 0,
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef<HTMLAnchorElement>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);
  const isPrimary = appearance === Button.appearances.primary;

  function getMaxContentWidth(): number {
    if (contentRef.current) {
      const allSpans: HTMLSpanElement[] = [];
      const styles = window.getComputedStyle(contentRef.current);

      const currentText = contentRef.current.textContent || "";
      const allTexts = [currentText, ...textstates];

      allTexts.forEach((text) => {
        const span = document.createElement("span");
        span.style.visibility = "hidden";
        span.style.position = "absolute";
        span.style.font = styles.font;
        span.style.padding = styles.padding;
        span.style.letterSpacing = isPrimary ? "4px" : "normal";
        span.textContent = text;

        document.body.appendChild(span);
        allSpans.push(span);
      });

      const maxWidth = Math.max(
        ...allSpans.map((element) => element.offsetWidth),
      );

      allSpans.forEach((span) => span.remove());
      return maxWidth;
    }
    return 0;
  }

  useEffect(() => {
    setContentWidth(getMaxContentWidth() + extracontentwidth);
  }, [textstates, extracontentwidth]);

  return (
    <a
      ref={contentRef}
      onMouseEnter={() => isPrimary && setIsHovered(true)}
      onMouseLeave={() => isPrimary && setIsHovered(false)}
      className={cx(
        classes.resetBtn,
        classes.button,
        appearance === appearances.primary && classes.primary,
        appearance === appearances.secondary && classes.secondary,
        appearance === appearances.round && classes.round,
        disabled ? classes.disabled : "",
      )}
      style={{
        width: contentWidth ? `${contentWidth}px` : undefined,
        letterSpacing: isPrimary && isHovered ? "4px" : "normal",
        transition: isPrimary ? "letter-spacing 1s ease" : undefined,
      }}
      {...props}
    />
  );
};

Button.appearances = appearances;

export default Button;
