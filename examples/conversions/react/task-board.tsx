import React, { useMemo } from "react";

type Task = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
};

type TaskBoardProps = {
  tasks?: Task[];
  onTaskSelect?: (task: Task) => void;
};

const columns = ["todo", "doing", "done"] as const;

export function TaskBoard({ tasks = [], onTaskSelect }: TaskBoardProps) {
  const grouped = useMemo(
    () =>
      columns.map((status) => ({
        status,
        tasks: tasks.filter((task) => task.status === status)
      })),
    [tasks]
  );

  return (
    <section className="task-board">
      {grouped.map((column) => (
        <article key={column.status}>
          <h3>{column.status}</h3>
          {column.tasks.map((task) => (
            <button key={task.id} onClick={() => onTaskSelect?.(task)}>
              {task.title}
            </button>
          ))}
        </article>
      ))}
    </section>
  );
}
