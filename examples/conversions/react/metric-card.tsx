import React, { useMemo } from "react";

type MetricCardProps = {
  label?: string;
  value?: number;
  delta?: number;
  onInspect?: (detail: { label: string; value: number }) => void;
};

export function MetricCard({
  label = "Revenue",
  value = 128,
  delta = 12,
  onInspect
}: MetricCardProps) {
  const tone = useMemo(() => (delta >= 0 ? "positive" : "negative"), [delta]);

  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <small className="metric-card__delta">
        {delta >= 0 ? "+" : ""}
        {delta}%
      </small>
      <button onClick={() => onInspect?.({ label, value })}>Inspect</button>
    </article>
  );
}
