import React from "react";
import { TextArea, ErrorWrapper } from "@/components/form/Form";
import classes from "./SecretInputText.module.css";

interface SecretInputTextProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  mobile?: boolean;
}

export const SecretInputText: React.FC<SecretInputTextProps> = ({
  value,
  onChange,
  error,
  mobile = false,
}) => {
  return (
    <ErrorWrapper
      className={classes.errorIndent}
      message={error ?? ""}
      data-testid="secret-content-error"
    >
      <TextArea
        data-testid="secret-content"
        rows={mobile ? 13 : 14}
        placeholder="Enter Secret Content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </ErrorWrapper>
  );
};
