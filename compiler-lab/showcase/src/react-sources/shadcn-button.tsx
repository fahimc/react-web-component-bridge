import React, { useMemo } from "react";

type ButtonVariant = "default" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ShadcnButtonProps = {
  disabled?: boolean;
  label?: string;
  loading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  onAction?: () => void;
};

const variantClasses: Record<ButtonVariant, string> = {
  default: "variant-default",
  outline: "variant-outline",
  secondary: "variant-secondary"
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: "size-lg",
  md: "size-md",
  sm: "size-sm"
};

export function ShadcnButton({
  disabled = false,
  label = "Open compiled button",
  loading = false,
  size = "md",
  variant = "default",
  onAction
}: ShadcnButtonProps) {
  const className = useMemo(
    () =>
      [
        "ui-button",
        variantClasses[variant] ?? variantClasses.default,
        sizeClasses[size] ?? sizeClasses.md
      ].join(" "),
    [size, variant]
  );

  return (
    <button className={className} disabled={disabled || loading} type="button" onClick={onAction}>
      {loading ? <span className="spinner" aria-hidden="true" /> : null}
      <span>{loading ? "Compiling..." : label}</span>
    </button>
  );
}
