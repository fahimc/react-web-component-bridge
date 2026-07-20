import React from "react";

type AlertBannerProps = {
  title?: string;
  message?: string;
  tone?: "info" | "success" | "warning" | "danger";
  onDismiss?: () => void;
};

export function AlertBanner({
  title = "System notice",
  message = "The deployment completed successfully.",
  tone = "info",
  onDismiss
}: AlertBannerProps) {
  return (
    <aside className={`alert-banner alert-banner--${tone}`} role="status">
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <button aria-label="Dismiss alert" onClick={() => onDismiss?.()}>
        Close
      </button>
    </aside>
  );
}
