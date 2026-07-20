import React, { useMemo, useState } from "react";

type Customer = {
  id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
};

type CustomerListProps = {
  customers?: Customer[];
  onCustomerOpen?: (customer: Customer) => void;
};

export function CustomerList({ customers = [], onCustomerOpen }: CustomerListProps) {
  const [query, setQuery] = useState("");
  const matches = useMemo(
    () => customers.filter((customer) => customer.name.toLowerCase().includes(query.toLowerCase())),
    [customers, query]
  );

  return (
    <section className="customer-list">
      <input
        value={query}
        placeholder="Search customers"
        onInput={(event) => setQuery(event.currentTarget.value)}
      />
      <ul>
        {matches.map((customer) => (
          <li key={customer.id}>
            <button onClick={() => onCustomerOpen?.(customer)}>
              <span>{customer.name}</span>
              <small>{customer.plan}</small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
