import React, { useMemo, useReducer, useState } from "react";

type Article = {
  author: string;
  body: string;
  favorites: number;
  tag: "compiler" | "angular" | "html" | "performance";
  title: string;
};

type FeedState = {
  activeTag: "all" | Article["tag"];
  favorited: string[];
};

const articles: Article[] = [
  {
    author: "Ada Lovelace",
    body: "A React-authored article card compiled into a browser custom element without shipping React.",
    favorites: 128,
    tag: "compiler",
    title: "Shipping React components as native tags"
  },
  {
    author: "Grace Hopper",
    body: "Angular consumes the generated bundle as plain custom elements and receives DOM events.",
    favorites: 86,
    tag: "angular",
    title: "Using compiled widgets inside Angular"
  },
  {
    author: "Linus Torvalds",
    body: "The production output is scanned for React import and root-render markers on every lab smoke run.",
    favorites: 64,
    tag: "performance",
    title: "Keeping the runtime small"
  }
];

function reducer(
  state: FeedState,
  action: { type: "tag"; tag: FeedState["activeTag"] } | { type: "favorite"; title: string }
) {
  if (action.type === "tag") {
    return { ...state, activeTag: action.tag };
  }
  const exists = state.favorited.includes(action.title);
  return {
    ...state,
    favorited: exists
      ? state.favorited.filter((item) => item !== action.title)
      : [...state.favorited, action.title]
  };
}

export function RealWorldApp() {
  const [state, dispatch] = useReducer(reducer, { activeTag: "all", favorited: [] });
  const [draft, setDraft] = useState("React stays in source. The compiled tag runs anywhere.");
  const filtered = useMemo(
    () =>
      articles.filter((article) => state.activeTag === "all" || article.tag === state.activeTag),
    [state.activeTag]
  );

  return (
    <section className="rw-app">
      <header className="rw-hero">
        <nav>
          <strong>conduit</strong>
          <span>Home</span>
          <span>New Article</span>
          <span>Settings</span>
        </nav>
        <div>
          <p className="origin">RealWorld React Redux app pattern</p>
          <h2>A full feed app compiled into one Web Component</h2>
          <p>
            Article lists, filters, stateful favorites, and an editor preview are authored as React
            and emitted as a custom element.
          </p>
        </div>
      </header>
      <main className="rw-layout">
        <section className="rw-feed">
          <div className="rw-tabs">
            {(
              ["all", "compiler", "angular", "html", "performance"] as FeedState["activeTag"][]
            ).map((tag) => (
              <button
                className={state.activeTag === tag ? "active" : ""}
                onClick={() => dispatch({ type: "tag", tag })}
              >
                {tag === "all" ? "Global Feed" : tag}
              </button>
            ))}
          </div>
          {filtered.map((article) => {
            const liked = state.favorited.includes(article.title);
            return (
              <article className="rw-article">
                <div>
                  <strong>{article.title}</strong>
                  <span>{article.author}</span>
                </div>
                <p>{article.body}</p>
                <footer>
                  <code>#{article.tag}</code>
                  <button onClick={() => dispatch({ type: "favorite", title: article.title })}>
                    {liked ? article.favorites + 1 : article.favorites} favorites
                  </button>
                </footer>
              </article>
            );
          })}
        </section>
        <aside className="rw-editor">
          <strong>Editor preview</strong>
          <textarea value={draft} onInput={(event) => setDraft(event.currentTarget.value)} />
          <p>{draft}</p>
        </aside>
      </main>
    </section>
  );
}
