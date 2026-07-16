import type { ReactElementOptions } from "../types/public";

export class MethodController {
  private ref: unknown;
  private readonly queue = new Map<string, unknown[][]>();

  constructor(private readonly options: ReactElementOptions) {}

  setRef(value: unknown): void {
    this.ref = value;
    for (const [name, calls] of this.queue) {
      for (const args of calls) {
        this.call(name, args);
      }
    }
    this.queue.clear();
  }

  createRefSetter(): (value: unknown) => void {
    return (value: unknown) => this.setRef(value);
  }

  call(name: string, args: readonly unknown[], host?: HTMLElement): unknown {
    const definition = this.options.methods?.[name];
    if (!definition) {
      throw new Error(`Unknown public method "${name}".`);
    }
    if (!this.ref) {
      if (definition.queue) {
        const calls = this.queue.get(name) ?? [];
        calls.push([...args]);
        this.queue.set(name, calls);
        return undefined;
      }
      throw new Error(`Cannot call "${name}" before the React component ref is mounted.`);
    }
    return definition.call(this.ref, host ?? (undefined as unknown as HTMLElement), ...args);
  }
}
