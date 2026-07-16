import type { ComponentType } from "react";
import { getReactElementGlobalConfig } from "../configuration/global-config";
import { createMetadata } from "../metadata/create-metadata";
import type {
  ReactCustomElementConstructor,
  ReactElementDefinition,
  ReactElementOptions
} from "../types/public";
import { normalizeCustomElementName } from "../utilities/casing";
import { scheduleMicrotask } from "../utilities/scheduling";
import { EventController } from "./event-controller";
import { FormController } from "./form-controller";
import { LifecycleController } from "./lifecycle";
import { MethodController } from "./method-controller";
import { PortalController } from "./portal-controller";
import { PropertyController } from "./property-controller";
import { RenderController } from "./render-controller";
import { SlotController } from "./slot-controller";
import { StyleController } from "./style-controller";

export function createReactElement<Props extends object, Ref = unknown>(
  tagName: string,
  component: ComponentType<Props>,
  options: ReactElementOptions<Props, Ref> = {}
): ReactElementDefinition<Props, Ref> {
  const normalizedTagName = normalizeCustomElementName(tagName);
  const runtimeOptions = options as unknown as ReactElementOptions<
    Record<string, unknown>,
    unknown
  >;
  if (typeof HTMLElement === "undefined") {
    return {
      tagName: normalizedTagName,
      component,
      options,
      elementClass: class {} as ReactCustomElementConstructor<Props>,
      metadata: createMetadata(normalizedTagName, runtimeOptions)
    };
  }

  const observedAttributes = PropertyController.observedAttributes(runtimeOptions);
  const formAssociated = Boolean(options.form);

  class ReactBridgeElement extends HTMLElement {
    static observedAttributes = observedAttributes;
    static formAssociated = formAssociated;

    private readonly config = getReactElementGlobalConfig();
    private readonly mount: HTMLElement;
    private readonly renderRoot: ShadowRoot | HTMLElement;
    readonly propertyController: PropertyController;
    private readonly eventController = new EventController(this, runtimeOptions);
    private readonly slotController = new SlotController(runtimeOptions);
    private readonly methodController = new MethodController(runtimeOptions);
    private readonly formController = new FormController(this, runtimeOptions);
    private readonly portalController: PortalController;
    private readonly renderController: RenderController;
    private readonly lifecycleController: LifecycleController;
    private renderScheduled = false;

    constructor() {
      super();
      this.renderRoot =
        options.shadow === false
          ? this
          : this.attachShadow({
              mode: options.shadow?.mode ?? "open",
              ...(options.shadow?.delegatesFocus === undefined
                ? {}
                : { delegatesFocus: options.shadow.delegatesFocus })
            });
      this.mount = document.createElement("span");
      this.mount.setAttribute("part", "react-mount");
      this.mount.setAttribute("data-rwcb-mount", "");
      this.renderRoot.append(this.mount);
      new StyleController(this.renderRoot, this, runtimeOptions.styles).apply();
      this.portalController = new PortalController(this, this.renderRoot, runtimeOptions);
      this.propertyController = new PropertyController({
        host: this,
        options: runtimeOptions,
        development: this.config.development ?? false,
        requestRender: () => this.requestRender(),
        formValueChanged: (name, value) => {
          this.formController.update(name, value);
          if (name === runtimeOptions.form?.valueProp) {
            this.formController.emitStandardChangeEvents();
          }
        }
      });
      this.renderController = new RenderController({
        host: this,
        component: component as ComponentType<Record<string, unknown>>,
        options: runtimeOptions,
        config: this.config,
        mount: this.mount,
        getProps: () => this.propertyController.getProps(),
        getEventProps: () => this.eventController.createEventProps(),
        getSlotProps: () => this.slotController.createSlotProps(),
        getPortalProps: () => this.portalController.getPortalProps(),
        refSetter: this.methodController.createRefSetter()
      });
      this.lifecycleController = new LifecycleController(
        this.renderController,
        () => this.requestRender(),
        () => this.portalController.cleanup()
      );
      this.propertyController.initializePreUpgradeProperties();
    }

    connectedCallback(): void {
      this.formController.connect();
      this.lifecycleController.connected();
    }

    disconnectedCallback(): void {
      this.lifecycleController.disconnected(this);
    }

    attributeChangedCallback(
      name: string,
      _oldValue: string | null,
      newValue: string | null
    ): void {
      this.propertyController.attributeChanged(name, newValue);
    }

    formResetCallback(): void {
      const valueProp = runtimeOptions.form?.valueProp;
      const defaultValue = valueProp ? runtimeOptions.props?.[valueProp]?.default : undefined;
      if (valueProp) {
        this.propertyController.setProperty(valueProp, defaultValue);
      }
    }

    callReactMethod(name: string, ...args: readonly unknown[]): unknown {
      return this.methodController.call(name, args, this);
    }

    private requestRender(): void {
      if (this.renderScheduled || !this.isConnected) {
        return;
      }
      this.renderScheduled = true;
      scheduleMicrotask(() => {
        this.renderScheduled = false;
        if (this.isConnected) {
          this.renderController.render();
        }
      });
    }
  }

  for (const prop of Object.keys(options.props ?? {})) {
    Object.defineProperty(ReactBridgeElement.prototype, prop, {
      get(this: ReactBridgeElement): unknown {
        return this.propertyController.getProperty(prop);
      },
      set(this: ReactBridgeElement, value: unknown): void {
        this.propertyController.setProperty(prop, value);
      }
    });
  }

  for (const methodName of Object.keys(options.methods ?? {})) {
    if (methodName in ReactBridgeElement.prototype) {
      throw new Error(`Cannot expose public method "${methodName}" because it already exists.`);
    }
    Object.defineProperty(ReactBridgeElement.prototype, methodName, {
      value(this: ReactBridgeElement, ...args: readonly unknown[]) {
        return this.callReactMethod(methodName, ...args);
      }
    });
  }

  return {
    tagName: normalizedTagName,
    component,
    options,
    elementClass: ReactBridgeElement as unknown as ReactCustomElementConstructor<Props>,
    metadata: createMetadata(normalizedTagName, runtimeOptions)
  };
}
