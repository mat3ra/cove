import { Action } from "@mat3ra/esse/dist/js/types";
/** Direct transport for a Python interpreter running in the same page as its host. */
export default class InPageTransport {
    constructor(sendToPython = () => undefined) {
        this.sendToPython = sendToPython;
    }
    init(receive) {
        this.previousSendDataToHost = window.sendDataToHost;
        window.sendDataToHost = (payload) => receive(Action.setData, payload);
    }
    destroy() {
        window.sendDataToHost = this.previousSendDataToHost;
    }
    send(action, payload) {
        this.sendToPython(action, payload);
    }
}
