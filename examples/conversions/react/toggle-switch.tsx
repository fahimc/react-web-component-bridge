import React, { useState } from "react";

type ToggleSwitchProps = {
  label?: string;
  defaultChecked?: boolean;
  onToggle?: (checked: boolean) => void;
};

export function ToggleSwitch({
  label = "Enabled",
  defaultChecked = false,
  onToggle
}: ToggleSwitchProps) {
  const [checked, setChecked] = useState(defaultChecked);

  function toggle() {
    const next = !checked;
    setChecked(next);
    onToggle?.(next);
  }

  return (
    <button className="toggle-switch" aria-pressed={checked} onClick={toggle}>
      <span>{label}</span>
      <span className="toggle-switch__track" data-checked={checked}>
        <span className="toggle-switch__thumb" />
      </span>
    </button>
  );
}
