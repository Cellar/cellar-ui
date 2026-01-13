import React, { useState, useEffect } from "react";
import { IApiError } from "@/models/error";
import Button from "@/components/buttons/Button";
import { useNavigate } from "react-router-dom";
import { Clock } from "@/components/characters/Clock";
import classes from "./RateLimitError.module.css";

interface RateLimitErrorProps {
  error: IApiError;
  onRetry?: () => void;
}

export const RateLimitError: React.FC<RateLimitErrorProps> = ({
  error,
  onRetry,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(
    error.retryAfter || 0,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const canRetry = secondsRemaining === 0;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ${secs} second${secs !== 1 ? "s" : ""}`;
  };

  return (
    <div className={classes.container} data-testid="rate-limit-error">
      <Clock className={classes.icon} data-testid="rate-limit-icon" />
      <h2 className={classes.title} data-testid="rate-limit-title">
        Rate Limit Exceeded
      </h2>
      <p className={classes.message} data-testid="rate-limit-message">
        {error.message}
      </p>

      {secondsRemaining > 0 && (
        <div className={classes.countdown} data-testid="rate-limit-countdown">
          <p>You can try again in:</p>
          <p className={classes.timer} data-testid="countdown-timer">
            {formatTime(secondsRemaining)}
          </p>
        </div>
      )}

      {error.rateLimit && (
        <div className={classes.rateLimitInfo} data-testid="rate-limit-info">
          <p>
            Requests remaining: {error.rateLimit.remaining} /{" "}
            {error.rateLimit.limit}
          </p>
          <p>
            Resets at:{" "}
            {new Date(error.rateLimit.reset * 1000).toLocaleTimeString()}
          </p>
        </div>
      )}

      <div className={classes.actions}>
        {onRetry && (
          <Button
            data-testid="retry-button"
            appearance={Button.appearances.primary}
            disabled={!canRetry}
            onClick={onRetry}
          >
            {canRetry ? "Try Again" : `Wait ${formatTime(secondsRemaining)}`}
          </Button>
        )}
        <Button
          data-testid="go-home-button"
          appearance={Button.appearances.secondary}
          onClick={() => navigate("/secret/create")}
        >
          Create New Secret
        </Button>
      </div>
    </div>
  );
};
