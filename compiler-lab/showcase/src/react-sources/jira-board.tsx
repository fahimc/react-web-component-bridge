import React, { useMemo, useReducer } from "react";

type LabIssue = {
  id: string;
  key: string;
  title: string;
  status: "Backlog" | "Selected" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  assignee: string;
};

type FilterState = {
  search: string;
  priority: "All" | "Low" | "Medium" | "High";
};

const defaultIssues: LabIssue[] = [
  {
    id: "j1",
    key: "RWCB-101",
    title: "Compile dashboard widgets",
    status: "In Progress",
    priority: "High",
    assignee: "Ada"
  },
  {
    id: "j2",
    key: "RWCB-118",
    title: "Ship Angular custom elements",
    status: "Selected",
    priority: "Medium",
    assignee: "Grace"
  },
  {
    id: "j3",
    key: "RWCB-144",
    title: "Verify browser smoke tests",
    status: "Done",
    priority: "Low",
    assignee: "Linus"
  }
];

function reducer(
  state: FilterState,
  action: { type: "search"; value: string } | { type: "priority"; value: FilterState["priority"] }
) {
  if (action.type === "search") {
    return { ...state, search: action.value };
  }
  return { ...state, priority: action.value };
}

export function JiraBoard(props: { issues?: LabIssue[]; onIssueOpen?: (issue: LabIssue) => void }) {
  const [filters, dispatch] = useReducer(reducer, { search: "", priority: "All" });
  const issues = props.issues ?? defaultIssues;
  const visibleIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const matchesSearch =
          issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          issue.key.toLowerCase().includes(filters.search.toLowerCase());
        const matchesPriority = filters.priority === "All" || issue.priority === filters.priority;
        return matchesSearch && matchesPriority;
      }),
    [filters.priority, filters.search, issues]
  );

  return (
    <section className="jira-board">
      <header>
        <p className="origin">Jira Clone board pattern</p>
        <h2>Kanban board</h2>
      </header>
      <div className="filters">
        <input
          aria-label="Search issues"
          value={filters.search}
          placeholder="Search issues"
          onInput={(event) => dispatch({ type: "search", value: event.currentTarget.value })}
        />
        <select
          value={filters.priority}
          onChange={(event) =>
            dispatch({
              type: "priority",
              value: event.currentTarget.value as FilterState["priority"]
            })
          }
        >
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
      <div className="issue-list">
        {visibleIssues.map((issue) => (
          <button className="issue" onClick={() => props.onIssueOpen?.(issue)}>
            <span>{issue.key}</span>
            <strong>{issue.title}</strong>
            <small>
              {issue.status} / {issue.priority} / {issue.assignee}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}
