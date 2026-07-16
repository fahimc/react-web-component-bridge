import type { ReactElementStyleInput } from "../types/public";

export class StyleController {
  constructor(
    private readonly root: ShadowRoot | HTMLElement,
    private readonly host: HTMLElement,
    private readonly styles: ReactElementStyleInput | undefined
  ) {}

  apply(): void {
    if (!this.styles) {
      return;
    }
    const inputs = this.resolveInputs(this.styles);
    const sheets = inputs.filter((style): style is CSSStyleSheet => typeof style !== "string");
    const text = inputs.filter((style): style is string => typeof style === "string");
    if ("adoptedStyleSheets" in this.root && sheets.length > 0) {
      const current = (this.root as ShadowRoot).adoptedStyleSheets ?? [];
      (this.root as ShadowRoot).adoptedStyleSheets = [...current, ...sheets];
    }
    for (const styleText of text) {
      const style = document.createElement("style");
      style.textContent = styleText;
      this.root.prepend(style);
    }
  }

  private resolveInputs(input: ReactElementStyleInput): Array<string | CSSStyleSheet> {
    const resolved = typeof input === "function" ? input(this.host) : input;
    if (Array.isArray(resolved)) {
      return resolved.flatMap((item) => (Array.isArray(item) ? [...item] : [item]));
    }
    return [resolved as string | CSSStyleSheet];
  }
}
