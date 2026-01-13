import React from "react";
import { useRouteError } from "react-router-dom";
import { IApiError, isRateLimitError } from "@/models/error";
import { RateLimitError } from "./RateLimitError";
import { NotFound } from "@/pages/NotFound";

export const ApiErrorBoundary: React.FC = () => {
  const error = useRouteError();

  if (isRateLimitError(error)) {
    return <RateLimitError error={error} />;
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const apiError = error as IApiError;
    if (apiError.code === 404) {
      return <NotFound />;
    }
  }

  return <NotFound />;
};
