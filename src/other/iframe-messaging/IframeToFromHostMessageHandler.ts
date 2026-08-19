import { Action, IframeMessageSchema } from "@mat3ra/esse/dist/js/types";

import DataBridge, { DataBridgeHandler } from "./DataBridge";
import IframeTransport from "./IframeTransport";

/** Backward-compatible facade over the generic registry and iframe transport. */
class IframeToFromHostMessageHandler {
    private bridge?: DataBridge;

    private pendingHandlers: Array<{
        action: IframeMessageSchema["action"];
        handlers: DataBridgeHandler[];
    }> = [];

    public init(iframeOriginURL: string, iframeId: string): void {
        this.bridge = new DataBridge(new IframeTransport(iframeOriginURL, iframeId));
        this.pendingHandlers.forEach(({ action, handlers }) =>
            this.bridge?.addHandlers(action, handlers),
        );
        this.pendingHandlers = [];
    }

    public destroy(): void {
        this.bridge?.destroy();
    }

    public addHandlers(action: IframeMessageSchema["action"], handlers: DataBridgeHandler[]): void {
        if (this.bridge) this.bridge.addHandlers(action, handlers);
        else this.pendingHandlers.push({ action, handlers });
    }

    public sendData(data: object): void {
        this.bridge?.send(Action.setData, data);
    }
}

export default IframeToFromHostMessageHandler;
