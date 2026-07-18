import React, { useMemo, useReducer, useState } from "react";

type Friend = {
  city: string;
  firstName: string;
  id: number;
  image: string;
  lastName: string;
  status: "Online" | "Away" | "Offline";
};

type State = {
  favorites: number[];
  notifications: string[];
  searchText: string;
};

const friends: Friend[] = [
  {
    city: "Budapest",
    firstName: "Igor",
    id: 1,
    image: "IM",
    lastName: "Mucsicska",
    status: "Online"
  },
  { city: "London", firstName: "Maya", id: 2, image: "MR", lastName: "Reed", status: "Away" },
  { city: "Berlin", firstName: "Jonas", id: 3, image: "JK", lastName: "Keller", status: "Online" },
  {
    city: "Lisbon",
    firstName: "Sofia",
    id: 4,
    image: "SA",
    lastName: "Almeida",
    status: "Offline"
  },
  { city: "Prague", firstName: "Tomas", id: 5, image: "TN", lastName: "Novak", status: "Online" }
];

function reducer(
  state: State,
  action:
    { type: "favorite"; friend: Friend } | { type: "search"; text: string } | { type: "clear" }
) {
  if (action.type === "search") return { ...state, searchText: action.text };
  if (action.type === "clear") return { ...state, notifications: [] };
  const exists = state.favorites.includes(action.friend.id);
  return {
    ...state,
    favorites: exists
      ? state.favorites.filter((id) => id !== action.friend.id)
      : [...state.favorites, action.friend.id],
    notifications: [
      `${action.friend.firstName} ${exists ? "removed from" : "added to"} favorites`,
      ...state.notifications
    ].slice(0, 3)
  };
}

export function LargeProjectDemoApp() {
  const [state, dispatch] = useReducer(reducer, {
    favorites: [1, 3],
    notifications: [],
    searchText: ""
  });
  const [pageSize, setPageSize] = useState(3);
  const visible = useMemo(
    () =>
      friends
        .filter((friend) =>
          `${friend.firstName} ${friend.lastName} ${friend.city}`
            .toLowerCase()
            .includes(state.searchText.toLowerCase())
        )
        .slice(0, pageSize),
    [pageSize, state.searchText]
  );

  return (
    <section className="large-app">
      <header className="large-hero">
        <div>
          <p className="origin">react-large-project-demo / packages/app</p>
          <h2>Friends workspace compiled from a large-project app pattern</h2>
          <span>
            Feature package boundaries, reducer-style state, search, notifications, and load-more
            behavior are represented in one compiled custom element.
          </span>
        </div>
        <strong>{state.favorites.length} favorites</strong>
      </header>
      <main className="large-layout">
        <section className="large-panel">
          <label>
            Search friends
            <input
              value={state.searchText}
              placeholder="Type a name or city"
              onInput={(event) => dispatch({ type: "search", text: event.currentTarget.value })}
            />
          </label>
          <div className="friend-list">
            {visible.map((friend) => {
              const favorite = state.favorites.includes(friend.id);
              return (
                <article className="friend-card">
                  <span className="avatar">{friend.image}</span>
                  <div>
                    <strong>
                      {friend.firstName} {friend.lastName}
                    </strong>
                    <small>
                      {friend.city} / {friend.status}
                    </small>
                  </div>
                  <button onClick={() => dispatch({ type: "favorite", friend })}>
                    {favorite ? "Remove favorite" : "Add favorite"}
                  </button>
                </article>
              );
            })}
          </div>
          {pageSize < friends.length ? (
            <button className="load-more" onClick={() => setPageSize(pageSize + 2)}>
              Load more friends
            </button>
          ) : null}
        </section>
        <aside className="large-panel">
          <strong>Mock API activity</strong>
          <p>
            Local state mirrors the repo's friends package flow: fetch result, reducer actions, and
            notification feedback.
          </p>
          <div className="notification-list">
            {state.notifications.length ? (
              state.notifications.map((message) => <span>{message}</span>)
            ) : (
              <span>No notifications yet</span>
            )}
          </div>
          <button className="secondary-action" onClick={() => dispatch({ type: "clear" })}>
            Clear notifications
          </button>
        </aside>
      </main>
    </section>
  );
}
