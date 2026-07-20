import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "@codedia/react-to-web-component-test-components/web-components";
import { sampleCustomers } from "@codedia/react-to-web-component-test-components";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "rwcb-customer-picker": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

function App() {
  const ref = useRef<HTMLElement & { customers: unknown[]; focusSearch(): void }>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.customers = sampleCustomers().slice(0, 10);
      ref.current.addEventListener("customer-select", (event) =>
        console.log((event as CustomEvent).detail)
      );
    }
  }, []);
  return <rwcb-customer-picker ref={ref} selected-id="c1" />;
}

createRoot(document.getElementById("root")!).render(<App />);
