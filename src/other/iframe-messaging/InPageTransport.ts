import { Action, IframeMessageSchema } from "@mat3ra/esse/dist/js/types";

import type { DataBridgeTransport } from "./DataBridge";

declare global {
    interface Window {
        sendDataToHost?: (payload: object) => void;
    }
}

/** Direct transport for a Python interpreter running in the same page as its host. */
export default class InPageTransport implements DataBridgeTransport {
    private previousSendDataToHost?: (payload: object) => void;

    private sendToPython: (action: IframeMessageSchema["action"], payload: object) => void;

    constructor(
        sendToPython: (action: IframeMessageSchema["action"], payload: object) => void = () =>
            undefined,
    ) {
        this.sendToPython = sendToPython;
    }

    init(receive: (action: IframeMessageSchema["action"], payload: object) => void): void {
        this.previousSendDataToHost = window.sendDataToHost;
        window.sendDataToHost = (payload) => receive(Action.setData, payload);
    }

    destroy(): void {
        window.sendDataToHost = this.previousSendDataToHost;
    }

    send(action: IframeMessageSchema["action"], payload: object): void {
        this.sendToPython(action, payload);
    }
}
