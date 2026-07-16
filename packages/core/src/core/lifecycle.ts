import type { RenderController } from "./render-controller";

export class LifecycleController {
  private disconnectToken = 0;

  constructor(
    private readonly render: RenderController,
    private readonly requestRender: () => void,
    private readonly cleanup: () => void
  ) {}

  connected(): void {
    this.disconnectToken++;
    this.render.reconnect();
    this.requestRender();
  }

  disconnected(host: HTMLElement): void {
    const token = ++this.disconnectToken;
    queueMicrotask(() => {
      if (token !== this.disconnectToken || host.isConnected) {
        return;
      }
      this.cleanup();
      this.render.unmount();
    });
  }
}
