import React, { useDeferredValue, useMemo, useState } from "react";

type FilterToolbarProps = {
  filters?: string[];
  onFilterChange?: (filter: string) => void;
};

export function FilterToolbar({
  filters = ["Open", "Closed", "Mine"],
  onFilterChange
}: FilterToolbarProps) {
  const [active, setActive] = useState(filters[0] ?? "");
  const deferredActive = useDeferredValue(active);
  const summary = useMemo(() => `Showing ${deferredActive || "all"} items`, [deferredActive]);

  return (
    <nav className="filter-toolbar" aria-label="Filters">
      {filters.map((filter) => (
        <button
          key={filter}
          aria-current={filter === active ? "page" : undefined}
          onClick={() => {
            setActive(filter);
            onFilterChange?.(filter);
          }}
        >
          {filter}
        </button>
      ))}
      <span>{summary}</span>
    </nav>
  );
}
