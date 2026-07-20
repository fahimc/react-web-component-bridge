import React, { useId } from "react";

type ProfileCardProps = {
  name?: string;
  role?: string;
  initials?: string;
  onMessage?: (name: string) => void;
};

export function ProfileCard({
  name = "Ada Lovelace",
  role = "Engineer",
  initials = "AL",
  onMessage
}: ProfileCardProps) {
  const titleId = useId();

  return (
    <article className="profile-card" aria-labelledby={titleId}>
      <span className="profile-card__avatar">{initials}</span>
      <div>
        <h3 id={titleId}>{name}</h3>
        <p>{role}</p>
      </div>
      <button onClick={() => onMessage?.(name)}>Message</button>
    </article>
  );
}
