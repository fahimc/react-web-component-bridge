import { isValidElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { isReactElementDefined, listReactElementDefinitions } from "../src";
import { FormController } from "../src/core/form-controller";
import { LifecycleController } from "../src/core/lifecycle";
import { MethodController } from "../src/core/method-controller";
import { PortalController } from "../src/core/portal-controller";
import { PropertyController } from "../src/core/property-controller";
import { SlotController } from "../src/core/slot-controller";
import { StyleController } from "../src/core/style-controller";
import { assertBrowserApi, warnDevelopment } from "../src/utilities/errors";
import { scheduleMicrotask } from "../src/utilities/scheduling";

const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("PropertyController", () => {
  it("observes attributes, initializes defaults, transforms, validates, reflects, and batches changes", () => {
    const host = document.createElement("div") as HTMLElement & { count?: number };
    host.count = 3;
    const requestRender = vi.fn();
    const formValueChanged = vi.fn();
    const controller = new PropertyController({
      host,
      development: true,
      requestRender,
      formValueChanged,
      options: {
        props: {
          label: { type: "string", default: "Ready", reflect: true },
          count: {
            attribute: "item-count",
            type: "number",
            reflect: true,
            transform: (value) => Number(value) + 1,
            validate: (value) => (Number(value) > 0 ? true : "Count must be positive")
          },
          payload: { attribute: false }
        }
      }
    });

    expect(
      PropertyController.observedAttributes({ props: { value: {}, payload: { attribute: false } } })
    ).toEqual(["value"]);
    expect(controller.getProperty("label")).toBe("Ready");

    controller.initializePreUpgradeProperties();
    expect(controller.getProperty("count")).toBe(4);
    expect(host.getAttribute("item-count")).toBe("4");
    expect(requestRender).toHaveBeenCalledTimes(1);
    expect(formValueChanged).toHaveBeenCalledWith("count", 4);

    controller.setProperty("label", "Ready");
    expect(requestRender).toHaveBeenCalledTimes(1);

    controller.attributeChanged("item-count", "9");
    expect(controller.getProps()).toMatchObject({ count: 10, label: "Ready" });

    controller.attributeChanged("unknown", "1");
    expect(controller.getProperty("unknown")).toBeUndefined();
  });

  it("warns in development for invalid and missing required values", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const controller = new PropertyController({
      host: document.createElement("div"),
      development: true,
      requestRender: vi.fn(),
      formValueChanged: vi.fn(),
      options: {
        props: {
          requiredValue: {
            required: true,
            validate: () => false
          }
        }
      }
    });

    controller.setProperty("requiredValue", "");
    expect(warn).toHaveBeenCalledWith(
      '[react-to-web-component-runtime] Invalid value for property "requiredValue".'
    );
    expect(warn).toHaveBeenCalledWith(
      '[react-to-web-component-runtime] Required property "requiredValue" is missing.'
    );
    warn.mockRestore();
  });
});

describe("FormController", () => {
  it("attaches internals, serializes values, validates, and emits standard events", () => {
    const host = document.createElement("div") as HTMLElement & {
      attachInternals?: () => {
        setFormValue: ReturnType<typeof vi.fn>;
        setValidity: ReturnType<typeof vi.fn>;
      };
    };
    const internals = { setFormValue: vi.fn(), setValidity: vi.fn() };
    host.attachInternals = () => internals;
    const input = vi.fn();
    const change = vi.fn();
    host.addEventListener("input", input);
    host.addEventListener("change", change);

    const controller = new FormController(host, {
      form: {
        valueProp: "value",
        serializeValue: (value) => JSON.stringify(value),
        validate: (value) => (value === "bad" ? "Invalid" : true)
      }
    });
    controller.connect();
    controller.update("ignored", "x");
    expect(internals.setFormValue).not.toHaveBeenCalled();

    controller.update("value", { city: "London" });
    expect(internals.setFormValue).toHaveBeenCalledWith('{"city":"London"}');
    expect(internals.setValidity).toHaveBeenCalledWith({});

    controller.update("value", "bad");
    expect(internals.setValidity).toHaveBeenCalledWith({ customError: true }, "Invalid");

    controller.emitStandardChangeEvents();
    expect(input).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("handles unavailable internals and default serialization", () => {
    const controller = new FormController(document.createElement("div"), {
      form: { valueProp: "value" }
    });
    expect(() => controller.connect()).not.toThrow();
    expect(() => controller.update("value", { ok: true })).not.toThrow();
    expect(() => controller.update("value", null)).not.toThrow();
  });
});

describe("PortalController", () => {
  it("creates, reuses, and cleans up portal containers for built-in targets", () => {
    const host = document.createElement("section");
    const shadow = host.attachShadow({ mode: "open" });
    const shadowPortal = new PortalController(host, shadow, {
      portal: { enabled: true, prop: "portalContainer", part: "overlay-root" }
    });
    const first = shadowPortal.getPortalProps().portalContainer;
    expect(first.getAttribute("part")).toBe("overlay-root");
    expect(shadowPortal.getPortalProps().portalContainer).toBe(first);
    shadowPortal.cleanup();
    expect(first.isConnected).toBe(false);

    const hostPortal = new PortalController(host, shadow, {
      portal: { enabled: true, prop: "portalContainer", target: "host" }
    });
    expect(hostPortal.getPortalProps().portalContainer.parentElement).toBe(host);

    const bodyPortal = new PortalController(host, shadow, {
      portal: { enabled: true, prop: "portalContainer", target: "body" }
    });
    expect(bodyPortal.getPortalProps().portalContainer.parentElement).toBe(document.body);
    bodyPortal.cleanup();
  });

  it("supports disabled, element, and function portal targets", () => {
    const host = document.createElement("section");
    const target = document.createElement("div");
    const disabled = new PortalController(host, host, {});
    expect(disabled.getPortalProps()).toEqual({});

    const supplied = new PortalController(host, host, {
      portal: { enabled: true, prop: "portalContainer", target }
    });
    expect(supplied.getPortalProps().portalContainer).toBe(target);

    const fromFactory = new PortalController(host, host, {
      portal: { enabled: true, prop: "portalContainer", target: () => target }
    });
    expect(fromFactory.getPortalProps().portalContainer).toBe(target);
  });
});

describe("StyleController", () => {
  it("injects style tags and constructable stylesheets", () => {
    const host = document.createElement("div");
    const root = document.createElement("section") as HTMLElement & {
      adoptedStyleSheets?: CSSStyleSheet[];
    };
    root.adoptedStyleSheets = [];
    const sheet = {} as CSSStyleSheet;

    new StyleController(root, host, () => ["span{color:red}", sheet]).apply();
    expect(root.querySelector("style")?.textContent).toBe("span{color:red}");
    expect(root.adoptedStyleSheets).toEqual([sheet]);

    new StyleController(root, host, undefined).apply();
    expect(root.querySelectorAll("style")).toHaveLength(1);
  });
});

describe("SlotController", () => {
  it("creates default, named, and fallback slot props", () => {
    const props = new SlotController({
      slots: {
        children: true,
        icon: "icon",
        footer: { name: "footer", fallback: "Fallback" }
      }
    }).createSlotProps();

    expect(isValidElement(props.children)).toBe(true);
    expect(isValidElement(props.icon)).toBe(true);
    expect(isValidElement(props.footer)).toBe(true);
    expect((props.icon as { props: { name: string } }).props.name).toBe("icon");
  });
});

describe("MethodController", () => {
  it("queues method calls before refs mount and rejects unknown methods", () => {
    const call = vi.fn();
    const controller = new MethodController({
      methods: {
        focusSearch: {
          queue: true,
          call: (instance, _host, value) => call(instance, value)
        }
      }
    });

    expect(() => controller.call("missing", [])).toThrow("Unknown public method");
    expect(controller.call("focusSearch", ["before"])).toBeUndefined();
    controller.setRef({ ready: true });
    expect(call).toHaveBeenCalledWith({ ready: true }, "before");
    expect(controller.call("focusSearch", ["after"])).toBeUndefined();
    expect(call).toHaveBeenCalledWith({ ready: true }, "after");
  });
});

describe("LifecycleController", () => {
  it("skips unmount for DOM moves and unmounts genuine removals", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const render = { reconnect: vi.fn(), unmount: vi.fn() };
    const requestRender = vi.fn();
    const cleanup = vi.fn();
    const controller = new LifecycleController(render, requestRender, cleanup);

    controller.connected();
    expect(render.reconnect).toHaveBeenCalledTimes(1);
    expect(requestRender).toHaveBeenCalledTimes(1);

    controller.disconnected(host);
    await nextFrame();
    expect(render.unmount).not.toHaveBeenCalled();

    host.remove();
    controller.disconnected(host);
    await nextFrame();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(render.unmount).toHaveBeenCalledTimes(1);
  });
});

describe("utilities and registry", () => {
  it("warns only when development warnings are enabled", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    warnDevelopment(false, "hidden");
    warnDevelopment(true, "visible");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("throws clear browser API errors and schedules microtasks", async () => {
    expect(() => assertBrowserApi("customElements", undefined)).toThrow(
      "customElements is unavailable"
    );
    const task = vi.fn();
    scheduleMicrotask(task);
    await Promise.resolve();
    expect(task).toHaveBeenCalledOnce();
  });

  it("falls back to promise scheduling when queueMicrotask is unavailable", async () => {
    const originalQueueMicrotask = globalThis.queueMicrotask;
    vi.stubGlobal("queueMicrotask", undefined);
    const task = vi.fn();
    try {
      scheduleMicrotask(task);
      await Promise.resolve();
      expect(task).toHaveBeenCalledOnce();
    } finally {
      vi.stubGlobal("queueMicrotask", originalQueueMicrotask);
    }
  });

  it("lists registered definitions and reports unknown definitions", () => {
    expect(isReactElementDefined("not-yet-defined")).toBe(false);
    expect(Array.isArray(listReactElementDefinitions())).toBe(true);
  });
});
