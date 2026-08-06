import { Action, IframeMessageSchema } from "@mat3ra/esse/dist/js/types";

export type DataBridgeHandler = (
    payload: IframeMessageSchema["payload"],
) => void | unknown | Promise<void | unknown>;

export interface DataBridgeTransport {
    init(receive: (action: IframeMessageSchema["action"], payload: object) => void): void;
    destroy(): void;
    send(action: IframeMessageSchema["action"], payload: object): void;
}

/** Entity-agnostic handler registry. Transports contain all environment-specific wiring. */
export default class DataBridge {
    private handlers = new Map<IframeMessageSchema["action"], DataBridgeHandler[]>();

    constructor(private transport: DataBridgeTransport) {
        transport.init((action, payload) => {
            this.receive(action, payload).catch((error) => {
                console.error("Error receiving bridge message:", error);
            });
        });
    }

    on(action: IframeMessageSchema["action"], handler: DataBridgeHandler): void {
        const handlers = this.handlers.get(action) || [];
        handlers.push(handler);
        this.handlers.set(action, handlers);
    }

    addHandlers(action: IframeMessageSchema["action"], handlers: DataBridgeHandler[]): void {
        handlers.forEach((handler) => this.on(action, handler));
    }

    send(action: IframeMessageSchema["action"], payload: object): void {
        this.transport.send(action, payload);
    }

    async receive(action: IframeMessageSchema["action"], payload: object = {}): Promise<void> {
        const handlers = this.handlers.get(action) || [];
        await Promise.all(
            handlers.map(async (handler) => {
                try {
                    const response = await handler(payload);
                    if (response !== undefined) this.send(Action.setData, response as object);
                } catch (error) {
                    console.error(`Error in handler for ${action}:`, error);
                }
            }),
        );
    }

    destroy(): void {
        this.transport.destroy();
    }
}
