import type { ReactElementGlobalConfig } from "../types/public";

let globalConfig: ReactElementGlobalConfig = {
  development: readNodeEnv() !== "production"
};

export function configureReactElements(config: ReactElementGlobalConfig): ReactElementGlobalConfig {
  globalConfig = { ...globalConfig, ...config };
  return getReactElementGlobalConfig();
}

export function getReactElementGlobalConfig(): ReactElementGlobalConfig {
  return { ...globalConfig };
}

function readNodeEnv(): string | undefined {
  const global = globalThis as typeof globalThis & {
    process?: { env?: { NODE_ENV?: string | undefined } };
  };
  return global.process?.env?.NODE_ENV;
}
