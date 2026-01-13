import React from "react";
import { IRateLimitInfo } from "@/models/error";
import { Warning } from "@/components/characters/Warning";
import classes from "./RateLimitWarning.module.css";

interface RateLimitWarningProps {
  rateLimit: IRateLimitInfo;
  threshold?: number;
}

export const RateLimitWarning: React.FC<RateLimitWarningProps> = ({
  rateLimit,
  threshold = 80,
}) => {
  if (rateLimit.percentUsed < threshold) return null;

  const resetTime = new Date(rateLimit.reset * 1000);
  const severity = rateLimit.percentUsed >= 95 ? "critical" : "warning";

  return (
    <div
      className={`${classes.banner} ${classes[severity]}`}
      data-testid="rate-limit-warning"
      data-severity={severity}
    >
      <Warning className={classes.icon} />
      <div className={classes.content}>
        <strong>Rate Limit Warning:</strong> You have {rateLimit.remaining} of{" "}
        {rateLimit.limit} requests remaining. Resets at{" "}
        {resetTime.toLocaleTimeString()}.
      </div>
    </div>
  );
};
