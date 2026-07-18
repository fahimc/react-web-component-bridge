import React, { createContext, useContext, useMemo } from "react";

type LabUser = {
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
};

const UserContext = createContext<LabUser>({
  firstName: "Ada",
  lastName: "Lovelace",
  role: "ADMIN"
});

function DashboardInfo() {
  const user = useContext(UserContext);
  const permissions = useMemo(
    () =>
      user.role === "ADMIN"
        ? ["Create discussions", "Edit discussions", "Delete discussions", "Moderate comments"]
        : ["Create comments", "Delete own comments"],
    [user.role]
  );

  return (
    <section className="bp-dashboard">
      <p className="origin">Bulletproof React dashboard pattern</p>
      <h2>
        Welcome{" "}
        <b>
          {user.firstName} {user.lastName}
        </b>
      </h2>
      <p>
        Your role is <strong>{user.role}</strong>
      </p>
      <ul>
        {permissions.map((item) => (
          <li>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function BulletproofDashboard(props: { user?: LabUser }) {
  return (
    <UserContext.Provider
      value={props.user ?? { firstName: "Grace", lastName: "Hopper", role: "ADMIN" }}
    >
      <DashboardInfo />
    </UserContext.Provider>
  );
}
