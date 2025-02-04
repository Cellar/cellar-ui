import { ComponentPropsWithoutRef, FC, MouseEventHandler } from "react";
import cx from "classnames";

import classes from "./Button.module.css";

interface ButtonProps extends ComponentPropsWithoutRef<"a"> {
  appearance?: string;
  disabled?: boolean;
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

const Button: Btn = (props) => {
  const { appearance, disabled } = props;

  return (
    <a
      className={cx(
        classes.resetBtn,
        classes.button,
        appearance === appearances.primary && classes.primary,
        appearance === appearances.secondary && classes.secondary,
        appearance === appearances.round && classes.round,
        disabled ? classes.disabled : "",
      )}
      {...props}
    />
  );
};

Button.appearances = appearances;

export default Button;
