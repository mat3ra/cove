import { Action } from "@mat3ra/esse/dist/js/types";
/** Entity-agnostic handler registry. Transports contain all environment-specific wiring. */
export default class DataBridge {
    constructor(transport) {
        this.transport = transport;
        this.handlers = new Map();
        transport.init((action, payload) => {
            this.receive(action, payload).catch((error) => {
                console.error("Error receiving bridge message:", error);
            });
        });
    }
    on(action, handler) {
        const handlers = this.handlers.get(action) || [];
        handlers.push(handler);
        this.handlers.set(action, handlers);
    }
    addHandlers(action, handlers) {
        handlers.forEach((handler) => this.on(action, handler));
    }
    send(action, payload) {
        this.transport.send(action, payload);
    }
    async receive(action, payload = {}) {
        const handlers = this.handlers.get(action) || [];
        await Promise.all(handlers.map(async (handler) => {
            try {
                const response = await handler(payload);
                if (response !== undefined)
                    this.send(Action.setData, response);
            }
            catch (error) {
                console.error(`Error in handler for ${action}:`, error);
            }
        }));
    }
    destroy() {
        this.transport.destroy();
    }
}
