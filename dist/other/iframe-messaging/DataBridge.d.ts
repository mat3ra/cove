import { IframeMessageSchema } from "@mat3ra/esse/dist/js/types";
export type DataBridgeHandler = (payload: IframeMessageSchema["payload"]) => void | unknown | Promise<void | unknown>;
export interface DataBridgeTransport {
    init(receive: (action: IframeMessageSchema["action"], payload: object) => void): void;
    destroy(): void;
    send(action: IframeMessageSchema["action"], payload: object): void;
}
/** Entity-agnostic handler registry. Transports contain all environment-specific wiring. */
export default class DataBridge {
    private transport;
    private handlers;
    constructor(transport: DataBridgeTransport);
    on(action: IframeMessageSchema["action"], handler: DataBridgeHandler): void;
    addHandlers(action: IframeMessageSchema["action"], handlers: DataBridgeHandler[]): void;
    send(action: IframeMessageSchema["action"], payload: object): void;
    receive(action: IframeMessageSchema["action"], payload?: object): Promise<void>;
    destroy(): void;
}
