import { IframeMessageSchema } from "@mat3ra/esse/dist/js/types";
import type { DataBridgeTransport } from "./DataBridge";
declare global {
    interface Window {
        sendDataToHost?: (payload: object) => void;
    }
}
/** Direct transport for a Python interpreter running in the same page as its host. */
export default class InPageTransport implements DataBridgeTransport {
    private previousSendDataToHost?;
    private sendToPython;
    constructor(sendToPython?: (action: IframeMessageSchema["action"], payload: object) => void);
    init(receive: (action: IframeMessageSchema["action"], payload: object) => void): void;
    destroy(): void;
    send(action: IframeMessageSchema["action"], payload: object): void;
}
