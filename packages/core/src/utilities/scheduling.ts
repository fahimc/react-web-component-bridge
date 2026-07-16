export type ScheduledTask = () => void;

export function scheduleMicrotask(task: ScheduledTask): void {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(task);
    return;
  }
  Promise.resolve().then(task);
}
