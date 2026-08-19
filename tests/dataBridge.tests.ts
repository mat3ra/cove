import { type IframeMessageSchema, Action } from "@mat3ra/esse/dist/js/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import DataBridge, { type DataBridgeTransport } from "../src/other/iframe-messaging/DataBridge";
import InPageTransport from "../src/other/iframe-messaging/InPageTransport";

class FakeTransport implements DataBridgeTransport {
    receive?: (action: IframeMessageSchema["action"], payload: object) => void;

    sent: Array<{ action: IframeMessageSchema["action"]; payload: object }> = [];

    destroyed = false;

    init(receive: (action: IframeMessageSchema["action"], payload: object) => void) {
        this.receive = receive;
    }

    destroy() {
        this.destroyed = true;
    }

    send(action: IframeMessageSchema["action"], payload: object) {
        this.sent.push({ action, payload });
    }
}

describe("DataBridge", () => {
    it("dispatches independently registered handlers", async () => {
        const transport = new FakeTransport();
        const bridge = new DataBridge(transport);
        const seen: object[] = [];
        bridge.on(Action.setData, (payload) => {
            seen.push(payload);
        });

        await bridge.receive(Action.setData, { entities: [] });

        assert.deepEqual(seen, [{ entities: [] }]);
    });

    it("sends handler return values back as set-data", async () => {
        const transport = new FakeTransport();
        const bridge = new DataBridge(transport);
        bridge.on(Action.getData, () => [{ name: "Si" }]);

        await bridge.receive(Action.getData);

        assert.deepEqual(transport.sent, [{ action: Action.setData, payload: [{ name: "Si" }] }]);
    });

    it("delegates sends and lifecycle to the transport", () => {
        const transport = new FakeTransport();
        const bridge = new DataBridge(transport);

        bridge.send(Action.info, { message: "ready" });
        bridge.destroy();

        assert.deepEqual(transport.sent, [{ action: Action.info, payload: { message: "ready" } }]);
        assert.equal(transport.destroyed, true);
    });
});

describe("InPageTransport", () => {
    it("installs the direct window function and restores the previous one on destroy", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).window = globalThis;
        const previous = () => undefined;
        window.sendDataToHost = previous;
        const outbound: Array<{ action: Action; payload: object }> = [];
        const received: object[] = [];
        const bridge = new DataBridge(
            new InPageTransport((action, payload) => outbound.push({ action, payload })),
        );
        bridge.on(Action.setData, (payload) => {
            received.push(payload);
        });

        window.sendDataToHost?.({ entities: [] });
        bridge.send(Action.getData, { materials: [] });
        await Promise.resolve();

        assert.deepEqual(received, [{ entities: [] }]);
        assert.deepEqual(outbound, [{ action: Action.getData, payload: { materials: [] } }]);
        bridge.destroy();
        assert.equal(window.sendDataToHost, previous);
    });
});
