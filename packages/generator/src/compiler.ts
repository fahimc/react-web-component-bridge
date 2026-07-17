import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import ts from "typescript";

export type CompileReactComponentOptions = {
  source: string;
  fileName?: string;
  includeRuntime?: boolean;
  preserveExports?: boolean;
};

export type CompileReactComponentResult = {
  code: string;
  diagnostics: string[];
};

export type CompileReactFileOptions = {
  input: string;
  outFile: string;
  includeRuntime?: boolean;
};

export type CompileReactFolderOptions = {
  rootDir: string;
  outDir: string;
  extensions?: readonly string[];
};

export type CompileReactFolderResult = {
  rootDir: string;
  outDir: string;
  files: Array<{ input: string; output: string }>;
};

const compileExtensions = new Set([".jsx", ".tsx"]);
const reactModuleSpecifiers = new Set([
  "react",
  "react-dom",
  "react-dom/client",
  "@fahimc/react-web-component-bridge/react"
]);

export async function compileReactFile(options: CompileReactFileOptions): Promise<void> {
  const source = await readFile(resolve(options.input), "utf8");
  const result = compileReactComponentSource({
    source,
    fileName: options.input,
    includeRuntime: options.includeRuntime ?? true
  });
  if (result.diagnostics.length > 0) {
    throw new Error(
      [
        `Unable to compile ${options.input}:`,
        ...result.diagnostics.map((item) => `- ${item}`)
      ].join("\n")
    );
  }
  await mkdir(dirname(resolve(options.outFile)), { recursive: true });
  await writeFile(resolve(options.outFile), result.code);
}

export async function compileReactFolder(
  options: CompileReactFolderOptions
): Promise<CompileReactFolderResult> {
  const rootDir = resolve(options.rootDir);
  const outDir = resolve(options.outDir);
  const extensions = new Set(options.extensions ?? compileExtensions);
  const files: Array<{ input: string; output: string }> = [];

  for await (const input of walkCompileFiles(rootDir, extensions)) {
    const relativePath = relative(rootDir, input);
    const output = resolve(outDir, relativePath).replace(/\.[cm]?[jt]sx$/, ".js");
    await compileReactFile({ input, outFile: output, includeRuntime: true });
    files.push({ input, output });
  }

  return { rootDir, outDir, files };
}

export function compileReactComponentSource(
  options: CompileReactComponentOptions
): CompileReactComponentResult {
  const diagnostics: string[] = [];
  const unsupported = findUnsupportedReactRuntimeApis(options.source);
  diagnostics.push(...unsupported);

  const stripped = stripReactImports(options.source);
  const transpiled = ts.transpileModule(stripped, {
    fileName: options.fileName ?? "component.tsx",
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      jsxFactory: "h",
      jsxFragmentFactory: "Fragment",
      isolatedModules: true,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      useDefineForClassFields: false
    },
    reportDiagnostics: true
  });

  diagnostics.push(
    ...(transpiled.diagnostics ?? []).map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
    )
  );

  const body = options.preserveExports
    ? transpiled.outputText
    : removeJavaScriptExports(transpiled.outputText);

  return {
    code: [options.includeRuntime === false ? "" : compiledRuntime(), body]
      .filter(Boolean)
      .join("\n\n"),
    diagnostics
  };
}

function stripReactImports(source: string): string {
  const sourceFile = ts.createSourceFile("component.tsx", source, ts.ScriptTarget.Latest, true);
  const ranges = sourceFile.statements
    .filter((statement): statement is ts.ImportDeclaration => ts.isImportDeclaration(statement))
    .filter((statement) => {
      const moduleSpecifier = statement.moduleSpecifier;
      return ts.isStringLiteral(moduleSpecifier) && reactModuleSpecifiers.has(moduleSpecifier.text);
    })
    .map((statement) => [statement.getFullStart(), statement.getEnd()] as const)
    .sort((a, b) => b[0] - a[0]);

  let code = source;
  for (const [start, end] of ranges) {
    code = `${code.slice(0, start)}${code.slice(end)}`;
  }
  return code;
}

function findUnsupportedReactRuntimeApis(source: string): string[] {
  const unsupported: Array<readonly [name: string, message: string]> = [
    ["createPortal", "createPortal is not supported by the no-React compiler yet."],
    ["lazy", "React.lazy is not supported by the no-React compiler."],
    ["Suspense", "Suspense is not supported by the no-React compiler."],
    ["createContext", "React context is not supported by the no-React compiler yet."],
    ["useContext", "useContext is not supported by the no-React compiler yet."],
    ["useReducer", "useReducer is not supported by the no-React compiler yet."],
    [
      "useImperativeHandle",
      "useImperativeHandle is replaced by custom-element method definitions."
    ],
    ["forwardRef", "forwardRef is replaced by custom-element method definitions."]
  ];
  return unsupported
    .filter(([name]) => new RegExp(`\\b${name}\\b`).test(source))
    .map(([, message]) => message);
}

function removeJavaScriptExports(source: string): string {
  return source
    .replace(/\bexport\s+default\s+/g, "")
    .replace(/\bexport\s+(?=(async\s+)?function\b|class\b|const\b|let\b|var\b)/g, "")
    .replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, "")
    .replace(/^\s*export\s+\{\};?\s*$/gm, "");
}

async function* walkCompileFiles(
  directory: string,
  extensions: ReadonlySet<string>
): AsyncGenerator<string> {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (![".git", "node_modules", "dist", "build", ".angular"].includes(entry.name)) {
        yield* walkCompileFiles(entryPath, extensions);
      }
      continue;
    }
    if (entry.isFile() && extensions.has(extname(entry.name))) {
      yield entryPath;
    }
  }
}

function compiledRuntime(): string {
  return `/* eslint-disable */
/* Generated by react-web-component-bridge compile. No React runtime is included. */
const Fragment = Symbol.for("rwcb.fragment");
let __rwcbCurrentInstance = null;

function h(type, props, ...children) {
  return { type, props: props || {}, children: children.flat(Infinity) };
}

function useState(initialValue) {
  if (!__rwcbCurrentInstance) throw new Error("useState can only run during render.");
  return __rwcbCurrentInstance.useState(initialValue);
}

function useMemo(factory, deps) {
  if (!__rwcbCurrentInstance) throw new Error("useMemo can only run during render.");
  return __rwcbCurrentInstance.useMemo(factory, deps);
}

function useRef(initialValue) {
  if (!__rwcbCurrentInstance) throw new Error("useRef can only run during render.");
  return __rwcbCurrentInstance.useRef(initialValue);
}

function useEffect() {}
function useLayoutEffect() {}
function useCallback(callback) { return callback; }
function memo(component) { return component; }

function defineComponentTag(tagName, Component, options = {}) {
  const propOptions = options.props || {};
  const eventOptions = options.events || {};
  const slotOptions = options.slots || {};
  const observed = Object.entries(propOptions)
    .filter(([, definition]) => definition?.attribute !== false)
    .map(([name, definition]) => definition?.attribute || toKebab(name));

  class CompiledReactElement extends HTMLElement {
    static observedAttributes = observed;

    constructor() {
      super();
      this.__rwcbProps = {};
      this.__rwcbHooks = [];
      this.__rwcbHookIndex = 0;
      this.__rwcbRenderQueued = false;
      this.__rwcbRoot = options.shadow === false ? this : this.attachShadow({ mode: options.shadow?.mode || "open", delegatesFocus: Boolean(options.shadow?.delegatesFocus) });
      this.__rwcbMount = document.createElement("span");
      this.__rwcbMount.setAttribute("part", "compiled-mount");
      this.__rwcbRoot.append(this.__rwcbMount);
      applyStyles(this.__rwcbRoot, options.styles);
      for (const [name, definition] of Object.entries(propOptions)) {
        if (definition && "default" in definition) this.__rwcbProps[name] = definition.default;
      }
    }

    connectedCallback() {
      this.__rwcbRender();
    }

    attributeChangedCallback(attributeName, _oldValue, nextValue) {
      const entry = Object.entries(propOptions).find(([name, definition]) => (definition?.attribute || toKebab(name)) === attributeName);
      if (!entry) return;
      const [name, definition] = entry;
      this.__rwcbProps[name] = parseAttribute(nextValue, definition);
      this.__rwcbScheduleRender();
    }

    __rwcbScheduleRender() {
      if (this.__rwcbRenderQueued || !this.isConnected) return;
      this.__rwcbRenderQueued = true;
      queueMicrotask(() => {
        this.__rwcbRenderQueued = false;
        if (this.isConnected) this.__rwcbRender();
      });
    }

    __rwcbRender() {
      this.__rwcbHookIndex = 0;
      const previous = __rwcbCurrentInstance;
      __rwcbCurrentInstance = this;
      try {
        const vnode = Component({
          ...this.__rwcbProps,
          ...this.__rwcbCreateEventProps(),
          ...this.__rwcbCreateSlotProps()
        });
        this.__rwcbMount.replaceChildren(renderVNode(vnode));
      } finally {
        __rwcbCurrentInstance = previous;
      }
    }

    __rwcbCreateEventProps() {
      const props = {};
      for (const [propName, definition] of Object.entries(eventOptions)) {
        props[propName] = (...args) => {
          const detail = typeof definition?.detail === "function" ? definition.detail(...args) : args[0];
          this.dispatchEvent(new CustomEvent(definition?.name || toKebab(propName.replace(/^on/, "")), { detail, bubbles: true, composed: true }));
        };
      }
      return props;
    }

    __rwcbCreateSlotProps() {
      const props = {};
      for (const [propName, definition] of Object.entries(slotOptions)) {
        const name = definition === true ? undefined : typeof definition === "string" ? definition : definition?.name;
        props[propName] = h("slot", name ? { name } : {});
      }
      return props;
    }

    useState(initialValue) {
      const index = this.__rwcbHookIndex++;
      if (!(index in this.__rwcbHooks)) {
        this.__rwcbHooks[index] = typeof initialValue === "function" ? initialValue() : initialValue;
      }
      const setValue = (nextValue) => {
        const currentValue = this.__rwcbHooks[index];
        this.__rwcbHooks[index] = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
        this.__rwcbScheduleRender();
      };
      return [this.__rwcbHooks[index], setValue];
    }

    useMemo(factory, deps) {
      const index = this.__rwcbHookIndex++;
      const record = this.__rwcbHooks[index];
      if (!record || !depsEqual(record.deps, deps)) {
        this.__rwcbHooks[index] = { deps, value: factory() };
      }
      return this.__rwcbHooks[index].value;
    }

    useRef(initialValue) {
      const index = this.__rwcbHookIndex++;
      if (!(index in this.__rwcbHooks)) this.__rwcbHooks[index] = { current: initialValue };
      return this.__rwcbHooks[index];
    }
  }

  for (const name of Object.keys(propOptions)) {
    Object.defineProperty(CompiledReactElement.prototype, name, {
      get() { return this.__rwcbProps[name]; },
      set(value) {
        this.__rwcbProps[name] = value;
        this.__rwcbScheduleRender();
      }
    });
  }

  for (const [name, definition] of Object.entries(options.methods || {})) {
    Object.defineProperty(CompiledReactElement.prototype, name, {
      value(...args) {
        if (typeof definition?.call === "function") return definition.call(this, ...args);
      }
    });
  }

  if (!customElements.get(tagName)) customElements.define(tagName, CompiledReactElement);
  return CompiledReactElement;
}

function renderVNode(vnode) {
  if (vnode == null || vnode === false || vnode === true) return document.createTextNode("");
  if (Array.isArray(vnode)) {
    const fragment = document.createDocumentFragment();
    for (const child of vnode) fragment.append(renderVNode(child));
    return fragment;
  }
  if (typeof vnode === "string" || typeof vnode === "number") return document.createTextNode(String(vnode));
  if (typeof vnode.type === "function") return renderVNode(vnode.type({ ...vnode.props, children: vnode.children }));
  if (vnode.type === Fragment) return renderVNode(vnode.children);
  const element = document.createElement(vnode.type);
  applyProps(element, vnode.props);
  for (const child of vnode.children || []) element.append(renderVNode(child));
  return element;
}

function applyProps(element, props) {
  for (const [name, value] of Object.entries(props || {})) {
    if (name === "children" || name === "key" || value == null || value === false) continue;
    if (name === "className") {
      element.setAttribute("class", value);
    } else if (name === "htmlFor") {
      element.setAttribute("for", value);
    } else if (name === "ref" && typeof value === "object") {
      value.current = element;
    } else if (name === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (/^on[A-Z]/.test(name) && typeof value === "function") {
      element.addEventListener(name.slice(2).toLowerCase(), value);
    } else if (name in element && typeof value !== "object") {
      element[name] = value;
    } else if (value === true) {
      element.setAttribute(name, "");
    } else {
      element.setAttribute(name, String(value));
    }
  }
}

function parseAttribute(value, definition = {}) {
  if (definition.type === "boolean") return value !== null;
  if (value === null) return undefined;
  if (definition.type === "number") return Number(value);
  if (definition.type === "json") {
    try { return JSON.parse(value); } catch { return definition.default; }
  }
  return value;
}

function applyStyles(root, styles) {
  if (!styles) return;
  const style = document.createElement("style");
  style.textContent = Array.isArray(styles) ? styles.join("\\n") : String(styles);
  root.prepend(style);
}

function depsEqual(previous, next) {
  return Array.isArray(previous) && Array.isArray(next) && previous.length === next.length && previous.every((value, index) => Object.is(value, next[index]));
}

function toKebab(value) {
  return value.replace(/[A-Z]/g, (match) => "-" + match.toLowerCase()).replace(/^-/, "");
}`;
}

export const compilerRuntimeForTesting = compiledRuntime;

export function defaultCompiledOutFile(input: string): string {
  return join(dirname(input), `${basename(input, extname(input))}.custom-element.js`);
}
