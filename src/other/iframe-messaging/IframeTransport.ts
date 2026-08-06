import { IframeMessageSchema, Type } from "@mat3ra/esse/dist/js/types";

import type { DataBridgeTransport } from "./DataBridge";

export default class IframeTransport implements DataBridgeTransport {
    private receive?: (action: IframeMessageSchema["action"], payload: object) => void;

    private hostOriginURL = "*";

    private iframeOriginURL: string;

    private iframeId: string;

    constructor(iframeOriginURL: string, iframeId: string) {
        this.iframeOriginURL = iframeOriginURL;
        this.iframeId = iframeId;
    }

    init(receive: (action: IframeMessageSchema["action"], payload: object) => void): void {
        this.receive = receive;
        this.hostOriginURL = window.location.origin;
        window.addEventListener("message", this.receiveMessage);
    }

    destroy(): void {
        window.removeEventListener("message", this.receiveMessage);
    }

    private receiveMessage = (event: MessageEvent<IframeMessageSchema>) => {
        if (
            this.iframeOriginURL !== "*" &&
            event.origin !== this.iframeOriginURL &&
            event.origin !== this.hostOriginURL
        ) {
            return;
        }
        if (event.data?.type === Type.fromIframeToHost) {
            this.receive?.(event.data.action, event.data.payload);
        }
    };

    send(action: IframeMessageSchema["action"], payload: object): void {
        const iframe = document.getElementById(this.iframeId) as HTMLIFrameElement | null;
        iframe?.contentWindow?.postMessage(
            { type: Type.fromHostToIframe, action, payload },
            this.iframeOriginURL,
        );
    }
}
