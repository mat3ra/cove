import { Type } from "@mat3ra/esse/dist/js/types";
export default class IframeTransport {
    constructor(iframeOriginURL, iframeId) {
        this.hostOriginURL = "*";
        this.receiveMessage = (event) => {
            var _a, _b;
            if (this.iframeOriginURL !== "*" &&
                event.origin !== this.iframeOriginURL &&
                event.origin !== this.hostOriginURL) {
                return;
            }
            if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.type) === Type.fromIframeToHost) {
                (_b = this.receive) === null || _b === void 0 ? void 0 : _b.call(this, event.data.action, event.data.payload);
            }
        };
        this.iframeOriginURL = iframeOriginURL;
        this.iframeId = iframeId;
    }
    init(receive) {
        this.receive = receive;
        this.hostOriginURL = window.location.origin;
        window.addEventListener("message", this.receiveMessage);
    }
    destroy() {
        window.removeEventListener("message", this.receiveMessage);
    }
    send(action, payload) {
        var _a;
        const iframe = document.getElementById(this.iframeId);
        (_a = iframe === null || iframe === void 0 ? void 0 : iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({ type: Type.fromHostToIframe, action, payload }, this.iframeOriginURL);
    }
}
