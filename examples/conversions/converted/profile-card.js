import { defineComponentTag, h, useId } from "./scaffold.js";

function ProfileCard({ name = "Ada Lovelace", role = "Engineer", initials = "AL", onMessage }) {
    const titleId = useId();
    return (h("article", { className: "profile-card", "aria-labelledby": titleId },
        h("span", { className: "profile-card__avatar" }, initials),
        h("div", null,
            h("h3", { id: titleId }, name),
            h("p", null, role)),
        h("button", { onClick: () => onMessage?.(name) }, "Message")));
}


defineComponentTag("demo-profile-card", ProfileCard, {"shadow":{"mode":"open"},"props":{"name":{"type":"string","reflect":true},"role":{"type":"string","reflect":true},"initials":{"type":"string","reflect":true}},"events":{"onMessage":{"name":"message"}},"styles":":host{display:block}.profile-card{display:flex;align-items:center;gap:1rem;border:1px solid #d9e2ec;padding:1rem;border-radius:.5rem}.profile-card__avatar{display:grid;place-items:center;width:3rem;height:3rem;border-radius:999px;background:#0f766e;color:white;font-weight:700}"});
