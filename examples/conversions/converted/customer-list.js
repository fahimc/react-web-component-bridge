import { defineComponentTag, h, useMemo, useState } from "./scaffold.js";

function CustomerList({ customers = [], onCustomerOpen }) {
    const [query, setQuery] = useState("");
    const matches = useMemo(() => customers.filter((customer) => customer.name.toLowerCase().includes(query.toLowerCase())), [customers, query]);
    return (h("section", { className: "customer-list" },
        h("input", { value: query, placeholder: "Search customers", onInput: (event) => setQuery(event.currentTarget.value) }),
        h("ul", null, matches.map((customer) => (h("li", { key: customer.id },
            h("button", { onClick: () => onCustomerOpen?.(customer) },
                h("span", null, customer.name),
                h("small", null, customer.plan))))))));
}


defineComponentTag("demo-customer-list", CustomerList, {"shadow":{"mode":"open"},"props":{"customers":{"attribute":false,"default":[]}},"events":{"onCustomerOpen":{"name":"customer-open"}},"styles":":host{display:block}.customer-list{display:grid;gap:.75rem}ul{list-style:none;padding:0;margin:0;display:grid;gap:.5rem}button{width:100%;display:flex;justify-content:space-between}"});
