import React, { FC } from "react";

export const Checkmark: FC<{ className?: string }> = ({
  className,
  ...props
}) => (
  <svg
    className={className}
    viewBox="0 0 11 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M1 4L4 7L10 1" stroke="#303030" stroke-width="1.5" />
  </svg>
);
