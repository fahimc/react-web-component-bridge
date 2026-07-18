import React, { useMemo, useReducer } from "react";

type Status = "Backlog" | "Selected" | "In Progress" | "Done";
type Priority = "Low" | "Medium" | "High";
type Issue = {
  assignee: string;
  estimate: number;
  key: string;
  priority: Priority;
  status: Status;
  title: string;
  type: "Story" | "Bug" | "Task";
};

type State = {
  priority: "All" | Priority;
  search: string;
  selectedKey: string;
};

const issues: Issue[] = [
  {
    assignee: "Ada",
    estimate: 8,
    key: "RWCB-101",
    priority: "High",
    status: "Backlog",
    title: "Compile marketing widgets",
    type: "Story"
  },
  {
    assignee: "Grace",
    estimate: 5,
    key: "RWCB-118",
    priority: "Medium",
    status: "Selected",
    title: "Ship Angular custom elements",
    type: "Task"
  },
  {
    assignee: "Linus",
    estimate: 3,
    key: "RWCB-144",
    priority: "Low",
    status: "In Progress",
    title: "Verify browser smoke tests",
    type: "Bug"
  },
  {
    assignee: "Margaret",
    estimate: 13,
    key: "RWCB-168",
    priority: "High",
    status: "In Progress",
    title: "Remove React runtime from bundle",
    type: "Story"
  },
  {
    assignee: "Barbara",
    estimate: 2,
    key: "RWCB-201",
    priority: "Medium",
    status: "Done",
    title: "Document compiler workflow",
    type: "Task"
  }
];

const columns: Status[] = ["Backlog", "Selected", "In Progress", "Done"];

function reducer(
  state: State,
  action:
    | { type: "search"; value: string }
    | { type: "priority"; value: State["priority"] }
    | { type: "select"; key: string }
) {
  if (action.type === "search") return { ...state, search: action.value };
  if (action.type === "priority") return { ...state, priority: action.value };
  return { ...state, selectedKey: action.key };
}

export function JiraApp(props: { onIssueOpen?: (issue: Issue) => void }) {
  const [state, dispatch] = useReducer(reducer, {
    priority: "All",
    search: "",
    selectedKey: "RWCB-168"
  });
  const visible = useMemo(
    () =>
      issues.filter((issue) => {
        const text = `${issue.key} ${issue.title} ${issue.assignee}`.toLowerCase();
        const search = text.includes(state.search.toLowerCase());
        const priority = state.priority === "All" || issue.priority === state.priority;
        return search && priority;
      }),
    [state.priority, state.search]
  );
  const selected = issues.find((issue) => issue.key === state.selectedKey) ?? issues[0];

  return (
    <section className="jira-app">
      <aside className="jira-left">
        <strong>RWCB Project</strong>
        <span>Kanban board</span>
        <span>Releases</span>
        <span>Reports</span>
        <span>Project settings</span>
      </aside>
      <main>
        <header className="jira-header">
          <div>
            <p className="origin">Jira Clone app pattern</p>
            <h2>React compiler launch board</h2>
          </div>
          <button>Create issue</button>
        </header>
        <div className="jira-controls">
          <input
            aria-label="Search issues"
            placeholder="Search issues"
            value={state.search}
            onInput={(event) => dispatch({ type: "search", value: event.currentTarget.value })}
          />
          <select
            value={state.priority}
            onChange={(event) =>
              dispatch({ type: "priority", value: event.currentTarget.value as State["priority"] })
            }
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <section className="jira-columns">
          {columns.map((column) => (
            <article className="jira-column">
              <header>
                <strong>{column}</strong>
                <span>{visible.filter((issue) => issue.status === column).length}</span>
              </header>
              {visible
                .filter((issue) => issue.status === column)
                .map((issue) => (
                  <button
                    className={state.selectedKey === issue.key ? "jira-card selected" : "jira-card"}
                    onClick={() => {
                      dispatch({ type: "select", key: issue.key });
                      props.onIssueOpen?.(issue);
                    }}
                  >
                    <strong>{issue.title}</strong>
                    <span>
                      {issue.key} / {issue.type}
                    </span>
                    <small>
                      {issue.priority} / {issue.assignee} / {issue.estimate} pts
                    </small>
                  </button>
                ))}
            </article>
          ))}
        </section>
      </main>
      <aside className="jira-detail">
        <p className="origin">Issue detail</p>
        <h3>{selected.key}</h3>
        <strong>{selected.title}</strong>
        <dl>
          <div>
            <dt>Status</dt>
            <dd>{selected.status}</dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>{selected.priority}</dd>
          </div>
          <div>
            <dt>Assignee</dt>
            <dd>{selected.assignee}</dd>
          </div>
          <div>
            <dt>Estimate</dt>
            <dd>{selected.estimate} points</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
