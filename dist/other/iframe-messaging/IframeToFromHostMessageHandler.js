import { Action } from "@mat3ra/esse/dist/js/types";
import DataBridge from "./DataBridge";
import IframeTransport from "./IframeTransport";
/** Backward-compatible facade over the generic registry and iframe transport. */
class IframeToFromHostMessageHandler {
    constructor() {
        this.pendingHandlers = [];
    }
    init(iframeOriginURL, iframeId) {
        this.bridge = new DataBridge(new IframeTransport(iframeOriginURL, iframeId));
        this.pendingHandlers.forEach(({ action, handlers }) => { var _a; return (_a = this.bridge) === null || _a === void 0 ? void 0 : _a.addHandlers(action, handlers); });
        this.pendingHandlers = [];
    }
    destroy() {
        var _a;
        (_a = this.bridge) === null || _a === void 0 ? void 0 : _a.destroy();
    }
    addHandlers(action, handlers) {
        if (this.bridge)
            this.bridge.addHandlers(action, handlers);
        else
            this.pendingHandlers.push({ action, handlers });
    }
    sendData(data) {
        var _a;
        (_a = this.bridge) === null || _a === void 0 ? void 0 : _a.send(Action.setData, data);
    }
}
export default IframeToFromHostMessageHandler;
