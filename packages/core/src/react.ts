import React, {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version
} from "react";
import type { ComponentType } from "react";
import { configureReactElements, getReactElementGlobalConfig } from "./configuration/global-config";
import {
  getReactElementDefinition,
  isReactElementDefined,
  listReactElementDefinitions
} from "./configuration/registry";
import { createReactElement } from "./core/create-react-element";
import { defineReactElement, defineReactElements } from "./core/define-react-element";
import type {
  ReactElementDefinition,
  ReactElementOptions,
  ReactElementGlobalConfig
} from "./types/public";

export default React;

export {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  configureReactElements,
  createContext,
  createElement,
  createReactElement,
  createRef,
  defineReactElement,
  defineReactElements,
  forwardRef,
  getReactElementDefinition,
  getReactElementGlobalConfig,
  isReactElementDefined,
  isValidElement,
  lazy,
  listReactElementDefinitions,
  memo,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version
};

export type {
  ComponentProps,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  CSSProperties,
  Dispatch,
  FC,
  JSX,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
  SetStateAction
} from "react";

export type {
  CallbackArgs,
  CallbackKeys,
  ReactCustomElementConstructor,
  ReactElementDefinition,
  ReactElementEvent,
  ReactElementEventDefinition,
  ReactElementFormDefinition,
  ReactElementGlobalConfig,
  ReactElementMetadata,
  ReactElementMethodDefinition,
  ReactElementOptions,
  ReactElementPortalDefinition,
  ReactElementPropDefinition,
  ReactElementPropType,
  ReactElementShadowOptions,
  ReactElementSlotDefinition,
  ReactElementStyleInput,
  ReactElementWrapper
} from "./types/public";

export type ComponentTagDefinition<
  Props extends object = Record<string, unknown>,
  Ref = unknown
> = ReactElementDefinition<Props, Ref> & {
  define(): ReactElementDefinition<Props, Ref>;
};

export function createComponentTag<Props extends object, Ref = unknown>(
  tagName: string,
  component: ComponentType<Props>,
  options: ReactElementOptions<Props, Ref> = {}
): ComponentTagDefinition<Props, Ref> {
  const definition = createReactElement(tagName, component, options);
  return Object.assign(definition, {
    define: () => defineReactElement(tagName, component, options)
  });
}

export function defineComponentTag<Props extends object, Ref = unknown>(
  tagName: string,
  component: ComponentType<Props>,
  options: ReactElementOptions<Props, Ref> = {}
): ComponentTagDefinition<Props, Ref> {
  const definition = defineReactElement(tagName, component, options);
  return Object.assign(definition, {
    define: () => definition
  });
}

export const createWebComponent = createComponentTag;
export const defineWebComponent = defineComponentTag;

export function configureReactApi(config: ReactElementGlobalConfig): ReactElementGlobalConfig {
  return configureReactElements(config);
}
