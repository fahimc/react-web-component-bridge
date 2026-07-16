import type { ReactElementOptions } from "../types/public";

type ElementInternalsLike = {
  setFormValue(value: FormDataEntryValue | null): void;
  setValidity(flags?: ValidityStateFlags, message?: string): void;
};

export class FormController {
  private internals: ElementInternalsLike | undefined;

  constructor(
    private readonly host: HTMLElement,
    private readonly options: ReactElementOptions
  ) {}

  connect(): void {
    if (!this.options.form || this.internals) {
      return;
    }
    const attach = (this.host as HTMLElement & { attachInternals?: () => ElementInternalsLike })
      .attachInternals;
    if (attach) {
      this.internals = attach.call(this.host);
    }
  }

  update(name: string, value: unknown): void {
    if (!this.options.form || name !== this.options.form.valueProp) {
      return;
    }
    const serialized = this.options.form.serializeValue
      ? this.options.form.serializeValue(value)
      : defaultSerializeValue(value);
    this.internals?.setFormValue(serialized);
    const validation = this.options.form.validate?.(value, this.host);
    if (validation && validation !== true) {
      this.internals?.setValidity({ customError: true }, validation);
    } else {
      this.internals?.setValidity({});
    }
  }

  emitStandardChangeEvents(): void {
    if (!this.options.form) {
      return;
    }
    this.host.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.host.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }
}

function defaultSerializeValue(value: unknown): FormDataEntryValue | null {
  if (value === undefined || value === null) return null;
  if (value instanceof File) return value;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
