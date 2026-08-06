import { IframeMessageSchema } from "@mat3ra/esse/dist/js/types";
import type { DataBridgeTransport } from "./DataBridge";
export default class IframeTransport implements DataBridgeTransport {
    private receive?;
    private hostOriginURL;
    private iframeOriginURL;
    private iframeId;
    constructor(iframeOriginURL: string, iframeId: string);
    init(receive: (action: IframeMessageSchema["action"], payload: object) => void): void;
    destroy(): void;
    private receiveMessage;
    send(action: IframeMessageSchema["action"], payload: object): void;
}
