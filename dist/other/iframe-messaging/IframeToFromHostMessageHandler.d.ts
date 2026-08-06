import { IframeMessageSchema } from "@mat3ra/esse/dist/js/types";
import { DataBridgeHandler } from "./DataBridge";
/** Backward-compatible facade over the generic registry and iframe transport. */
declare class IframeToFromHostMessageHandler {
    private bridge?;
    private pendingHandlers;
    init(iframeOriginURL: string, iframeId: string): void;
    destroy(): void;
    addHandlers(action: IframeMessageSchema["action"], handlers: DataBridgeHandler[]): void;
    sendData(data: object): void;
}
export default IframeToFromHostMessageHandler;
