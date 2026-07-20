export function warnDevelopment(enabled: boolean, message: string): void {
  if (enabled && typeof console !== "undefined") {
    console.warn(`[react-to-web-component-runtime] ${message}`);
  }
}

export function assertBrowserApi(apiName: string, value: unknown): void {
  if (!value) {
    throw new Error(
      `${apiName} is unavailable. Custom element registration must run in a browser.`
    );
  }
}
