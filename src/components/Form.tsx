import { ComponentPropsWithoutRef, FC, useState } from "react";
import cx from "classnames";

import classes from "./Form.module.css";

export const Form: FC<ComponentPropsWithoutRef<"form">> = (props) => {
  const { className, ...rest } = props;

  return <form className={cx(classes.form, className)} {...rest} />;
};

interface FlatInputWrapperProps extends ComponentPropsWithoutRef<"div"> {
  label?: string;
}

export const FlatInputWrapper: FC<FlatInputWrapperProps> = (props) => {
  const { children, className, label, ...rest } = props;

  return (
    <div className={cx(classes.flatInputWrapper, className)} {...rest}>
      {children}
      {label && <label className={classes.label}>{label}</label>}
    </div>
  );
};

interface FlatInputProps extends ComponentPropsWithoutRef<"input"> {
  wrapperClassName?: string;
  label?: string;
}

export const FlatInput: FC<FlatInputProps> = (props) => {
  const { label, wrapperClassName, className, ...rest } = props;

  return (
    <FlatInputWrapper label={label} className={wrapperClassName}>
      <input className={cx(classes.flatInput, className)} {...rest} />
    </FlatInputWrapper>
  );
};

interface RoundInputWrapperProps extends ComponentPropsWithoutRef<"div"> {
  label?: string;
}

export const RoundInputWrapper: FC<RoundInputWrapperProps> = (props) => {
  const { children, className, label, ...rest } = props;

  return (
    <div className={cx(classes.roundInputWrapper, className)} {...rest}>
      {label && <label className={classes.label}>{label}</label>}
      {children}
    </div>
  );
};

interface TextAreaProps extends ComponentPropsWithoutRef<"textarea"> {
  wrapperClassName?: string;
  label?: string;
}

export const TextArea: FC<TextAreaProps> = (props) => {
  const { wrapperClassName, className, label, ...rest } = props;

  return (
    <RoundInputWrapper className={wrapperClassName} label={label}>
      <textarea
        className={cx(classes.roundInput, classes.textArea, className)}
        {...rest}
      />
    </RoundInputWrapper>
  );
};

interface NumericInputProps extends ComponentPropsWithoutRef<"input"> {
  wrapperClassName?: string;
}

export const NumericInput: FC<NumericInputProps> = (props) => {
  const { wrapperClassName, className, ...rest } = props;

  return (
    <RoundInputWrapper className={wrapperClassName}>
      <input
        className={cx(classes.roundInput, className)}
        inputMode={"numeric"}
        {...rest}
      />
    </RoundInputWrapper>
  );
};

export const FormButton: FC<ComponentPropsWithoutRef<"button">> = (props) => {
  const { children, className, ...rest } = props;

  return (
    <button
      type="button"
      className={cx(classes.roundInput, classes.formButton, className)}
      {...rest}
    >
      {children}
    </button>
  );
};

interface ToggleButtonProps extends ComponentPropsWithoutRef<"button"> {
  setParentState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ToggleButton: FC<ToggleButtonProps> = (props) => {
  const { setParentState, children, className, ...rest } = props;

  const [isOn, setIsOn] = useState(false);

  return (
    <FormButton
      className={cx(className, isOn && classes.toggled)}
      onClick={() => {
        setIsOn(!isOn);
        setParentState(!isOn);
      }}
      {...rest}
    >
      {children}
    </FormButton>
  );
};

interface DropdownItem {
  label: string;
  value: string;
}

interface FlatSelectProps extends ComponentPropsWithoutRef<"select"> {
  items: DropdownItem[];
  selected: string;
  wrapperClassName?: string;
  label?: string;
}

export const FlatSelect: FC<FlatSelectProps> = (props) => {
  const { label, wrapperClassName, className, items, selected, ...rest } =
    props;

  return (
    <FlatInputWrapper label={label} className={wrapperClassName}>
      <select
        className={cx(classes.select, className)}
        value={selected}
        {...rest}
      >
        {items.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </FlatInputWrapper>
  );
};

interface ErrorWrapperProps extends ComponentPropsWithoutRef<"span"> {
  message: string;
}

export const ErrorWrapper: FC<ErrorWrapperProps> = (props) => {
  const { children, className, message, ...rest } = props;

  return (
    <div className={cx(classes.errorWrapper)}>
      {children}
      {message.length > 0 && (
        <span className={cx(classes.error, className)} {...rest}>
          {message}
        </span>
      )}
    </div>
  );
};
