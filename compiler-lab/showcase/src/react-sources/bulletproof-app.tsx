import React, { createContext, useContext, useMemo, useState } from "react";

type Role = "ADMIN" | "EDITOR" | "VIEWER";
type User = { firstName: string; lastName: string; role: Role };
type Discussion = {
  comments: number;
  owner: string;
  status: "Open" | "Review" | "Resolved";
  title: string;
};

const AuthContext = createContext<User>({
  firstName: "Katherine",
  lastName: "Johnson",
  role: "ADMIN"
});

const discussions: Discussion[] = [
  { comments: 18, owner: "Platform", status: "Open", title: "Compiler output contract" },
  {
    comments: 9,
    owner: "Design Systems",
    status: "Review",
    title: "Component library variant policy"
  },
  { comments: 31, owner: "Frameworks", status: "Resolved", title: "Angular consumer integration" }
];

function usePermissions(role: Role) {
  return useMemo(
    () => ({
      canCreate: role === "ADMIN" || role === "EDITOR",
      canDelete: role === "ADMIN",
      canModerate: role !== "VIEWER"
    }),
    [role]
  );
}

function DashboardContent() {
  const user = useContext(AuthContext);
  const [status, setStatus] = useState<"All" | Discussion["status"]>("All");
  const permissions = usePermissions(user.role);
  const visible = useMemo(
    () => discussions.filter((discussion) => status === "All" || discussion.status === status),
    [status]
  );

  return (
    <section className="bp-app">
      <aside className="bp-sidebar">
        <strong>Bulletproof</strong>
        <span>Dashboard</span>
        <span>Discussions</span>
        <span>Users</span>
        <span>Audit log</span>
      </aside>
      <main>
        <header className="bp-header">
          <div>
            <p className="origin">Bulletproof React app pattern</p>
            <h2>
              Welcome {user.firstName} {user.lastName}
            </h2>
            <span>{user.role} workspace with permission-gated actions</span>
          </div>
          <button disabled={!permissions.canCreate}>Create discussion</button>
        </header>
        <section className="bp-metrics">
          <article>
            <strong>58</strong>
            <span>active users</span>
          </article>
          <article>
            <strong>12</strong>
            <span>open reviews</span>
          </article>
          <article>
            <strong>{permissions.canDelete ? "Full" : "Limited"}</strong>
            <span>admin access</span>
          </article>
        </section>
        <div className="bp-filter">
          {(["All", "Open", "Review", "Resolved"] as Array<"All" | Discussion["status"]>).map(
            (item) => (
              <button className={status === item ? "active" : ""} onClick={() => setStatus(item)}>
                {item}
              </button>
            )
          )}
        </div>
        <section className="bp-table">
          {visible.map((discussion) => (
            <article>
              <div>
                <strong>{discussion.title}</strong>
                <span>{discussion.owner}</span>
              </div>
              <code>{discussion.status}</code>
              <span>{discussion.comments} comments</span>
              <button disabled={!permissions.canModerate}>Moderate</button>
            </article>
          ))}
        </section>
      </main>
    </section>
  );
}

export function BulletproofApp(props: { user?: User }) {
  return (
    <AuthContext.Provider
      value={props.user ?? { firstName: "Katherine", lastName: "Johnson", role: "ADMIN" }}
    >
      <DashboardContent />
    </AuthContext.Provider>
  );
}
