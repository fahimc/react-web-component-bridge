import type { ComponentType, ReactNode } from "react";

export type ReactElementPropType = "string" | "number" | "boolean" | "json" | "date";

export type ReactElementPropDefinition<Host extends HTMLElement = HTMLElement, Value = unknown> = {
  attribute?: string | false;
  type?: ReactElementPropType;
  default?: Value;
  reflect?: boolean;
  required?: boolean;
  parseAttribute?: (value: string | null, host: Host) => Value;
  serializeAttribute?: (value: Value, host: Host) => string | null;
  validate?: (value: Value, host: Host) => boolean | string;
  transform?: (value: Value, host: Host) => Value;
};

export type CallbackKeys<Props> = {
  [Key in keyof Props]: Props[Key] extends (...args: infer Args) => unknown ? Key : never;
}[keyof Props];

export type CallbackArgs<Props, Key extends keyof Props> = Props[Key] extends (
  ...args: infer Args
) => unknown
  ? Args
  : never;

export type ReactElementEventDefinition<Args extends readonly unknown[] = readonly unknown[]> = {
  name?: string;
  detail?: (...args: Args) => unknown;
  bubbles?: boolean;
  composed?: boolean;
  cancelable?: boolean;
};

export type ReactElementSlotDefinition = true | string | { name?: string; fallback?: ReactNode };

export type ReactElementMethodDefinition<Ref = unknown, Host extends HTMLElement = HTMLElement> = {
  call: (instance: Ref, host: Host, ...args: readonly unknown[]) => unknown;
  queue?: boolean;
};

export type ReactElementFormDefinition<Props = Record<string, unknown>> = {
  valueProp: keyof Props & string;
  nameProp?: keyof Props & string;
  disabledProp?: keyof Props & string;
  requiredProp?: keyof Props & string;
  changeCallback?: keyof Props & string;
  serializeValue?: (value: unknown) => FormDataEntryValue | null;
  validate?: (value: unknown, host: HTMLElement) => string | true;
};

export type ReactElementShadowOptions =
  | false
  | {
      mode?: ShadowRootMode;
      delegatesFocus?: boolean;
    };

export type ReactElementStyleInput =
  | string
  | CSSStyleSheet
  | readonly (string | CSSStyleSheet)[]
  | ((host: HTMLElement) => string | CSSStyleSheet | readonly (string | CSSStyleSheet)[]);

export type ReactElementPortalDefinition<Props = Record<string, unknown>> = {
  enabled?: boolean;
  prop?: keyof Props & string;
  part?: string;
  target?: "shadow" | "host" | "body" | HTMLElement | ((host: HTMLElement) => HTMLElement);
};

export type ReactElementWrapper = (component: ReactNode, host: HTMLElement) => ReactNode;

export type ReactElementGlobalConfig = {
  strictMode?: boolean;
  wrap?: ReactElementWrapper;
  development?: boolean;
  renderError?: (error: unknown, host: HTMLElement) => void;
};

export type ReactElementOptions<Props extends object = Record<string, unknown>, Ref = unknown> = {
  shadow?: ReactElementShadowOptions;
  props?: Partial<{
    [Key in keyof Props & string]: ReactElementPropDefinition<HTMLElement, Props[Key]>;
  }>;
  events?: Partial<{
    [Key in CallbackKeys<Props> & string]: ReactElementEventDefinition<
      CallbackArgs<Props, Key & keyof Props>
    >;
  }>;
  slots?: Partial<Record<(keyof Props & string) | "children" | string, ReactElementSlotDefinition>>;
  methods?: Record<string, ReactElementMethodDefinition<Ref>>;
  form?: ReactElementFormDefinition<Props>;
  portal?: ReactElementPortalDefinition<Props>;
  styles?: ReactElementStyleInput;
  wrap?: ReactElementWrapper;
  strictMode?: boolean;
  errorBoundary?: ComponentType<{ error: unknown; children?: ReactNode }>;
  fallback?: ReactNode;
};

export type ReactCustomElementConstructor<Props = Record<string, unknown>> = {
  new (): HTMLElement & Props;
  observedAttributes: string[];
  formAssociated?: boolean;
};

export type ReactElementMetadata = {
  tagName: string;
  properties: Array<{ name: string; attribute?: string; type?: string; required?: boolean }>;
  attributes: Array<{ name: string; property: string; reflect?: boolean }>;
  events: Array<{ name: string; prop: string; bubbles: boolean; composed: boolean }>;
  slots: Array<{ prop: string; name: string | null }>;
  methods: Array<{ name: string }>;
  formAssociated: boolean;
  shadow: boolean;
};

export type ReactElementDefinition<
  Props extends object = Record<string, unknown>,
  Ref = unknown
> = {
  tagName: string;
  component: ComponentType<Props>;
  options: ReactElementOptions<Props, Ref>;
  elementClass: ReactCustomElementConstructor<Props>;
  metadata: ReactElementMetadata;
};

export type ReactElementEvent<
  Definition extends ReactElementDefinition,
  EventName extends string
> = CustomEvent<
  Extract<Definition["metadata"]["events"][number], { name: EventName }> extends never
    ? unknown
    : unknown
>;
