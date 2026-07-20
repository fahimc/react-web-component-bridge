import { defineComponentTag, h, useMemo } from "./scaffold.js";

const columns = ["todo", "doing", "done"];
function TaskBoard({ tasks = [], onTaskSelect }) {
    const grouped = useMemo(() => columns.map((status) => ({
        status,
        tasks: tasks.filter((task) => task.status === status)
    })), [tasks]);
    return (h("section", { className: "task-board" }, grouped.map((column) => (h("article", { key: column.status },
        h("h3", null, column.status),
        column.tasks.map((task) => (h("button", { key: task.id, onClick: () => onTaskSelect?.(task) }, task.title))))))));
}


defineComponentTag("demo-task-board", TaskBoard, {"shadow":{"mode":"open"},"props":{"tasks":{"attribute":false,"default":[]}},"events":{"onTaskSelect":{"name":"task-select"}},"styles":":host{display:block}.task-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}article{border:1px solid #d9e2ec;padding:.75rem;border-radius:.5rem}button{display:block;width:100%;margin:.5rem 0}"});
