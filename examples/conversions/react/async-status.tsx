import React, { lazy, Suspense, useState } from "react";

const LoadedMessage = lazy(async () => ({
  default: function LoadedMessage() {
    return <strong>Async content loaded</strong>;
  }
}));

type AsyncStatusProps = {
  label?: string;
  onRefresh?: () => void;
};

export function AsyncStatus({ label = "Service status", onRefresh }: AsyncStatusProps) {
  const [refreshes, setRefreshes] = useState(0);

  return (
    <section className="async-status">
      <h3>{label}</h3>
      <Suspense fallback={<span>Loading status...</span>}>
        <LoadedMessage />
      </Suspense>
      <button
        onClick={() => {
          setRefreshes(refreshes + 1);
          onRefresh?.();
        }}
      >
        Refresh {refreshes}
      </button>
    </section>
  );
}
