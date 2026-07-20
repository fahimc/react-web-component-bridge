import { defineComponentTag, h, memo } from "./scaffold.js";

const PricingCard = memo(function PricingCard({ plan = "Pro", price = 29, featured = false, onChoose }) {
    return (h("article", { className: "pricing-card", "data-featured": featured },
        h("p", null, featured ? "Recommended" : "Plan"),
        h("h3", null, plan),
        h("strong", null,
            "$",
            price,
            "/mo"),
        h("button", { onClick: () => onChoose?.(plan) },
            "Choose ",
            plan)));
});


defineComponentTag("demo-pricing-card", PricingCard, {"shadow":{"mode":"open"},"props":{"plan":{"type":"string","reflect":true},"price":{"type":"number","reflect":true},"featured":{"type":"boolean","reflect":true}},"events":{"onChoose":{"name":"choose"}},"styles":":host{display:block}.pricing-card{border:1px solid #d9e2ec;padding:1rem;border-radius:.5rem}.pricing-card[data-featured=true]{border-color:#0f766e;box-shadow:0 0 0 2px rgba(15,118,110,.2)}"});
