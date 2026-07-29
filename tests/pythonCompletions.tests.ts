import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    type CompletionBackend,
    buildInfoNode,
    jediTypeToCm,
    makeReplCompletionSource,
} from "../src/other/codemirror/utils/pythonCompletions";

// buildInfoNode() only needs createElement/style/textContent/appendChild — a plain Node test has no
// DOM, so stub just that much rather than pulling in a full DOM library for one test.
class FakeElement {
    style: Record<string, string> = {};

    children: FakeElement[] = [];

    private text = "";

    set textContent(value: string) {
        this.text = value;
        this.children = [];
    }

    get textContent(): string {
        return this.text + this.children.map((child) => child.textContent).join("");
    }

    appendChild(child: FakeElement) {
        this.children.push(child);
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).document = { createElement: () => new FakeElement() };

// A single-line CompletionContext stub: enough surface for the source (matchBefore /\w*/, doc access).
const makeContext = (source: string, pos: number, explicit = false) => {
    const text = (source.slice(0, pos).match(/\w*$/) ?? [""])[0];
    const from = pos - text.length;
    return {
        pos,
        explicit,
        matchBefore: () => ({ from, to: pos, text }),
        state: {
            doc: {
                toString: () => source,
                sliceString: (a: number, b: number) => source.slice(a, b),
                lineAt: () => ({ number: 1, from: 0 }),
            },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
};

const backend = (over: Partial<CompletionBackend> = {}): CompletionBackend => ({
    isInitialized: true,
    complete: () => [
        { name: "supercell", type: "instance" },
        { name: "create_supercell", type: "function" },
    ],
    describe: (_s, _l, _c, name) => ({ signature: `${name}(x)`, docstring: `doc for ${name}` }),
    ...over,
});

describe("jediTypeToCm", () => {
    it("maps Jedi kinds to CodeMirror completion types", () => {
        assert.equal(jediTypeToCm("function"), "function");
        assert.equal(jediTypeToCm("instance"), "variable");
        assert.equal(jediTypeToCm("module"), "namespace");
        assert.equal(jediTypeToCm("keyword"), "keyword");
    });
    it("falls back to 'variable' for unknown kinds", () => {
        assert.equal(jediTypeToCm("weird"), "variable");
    });
});

describe("buildInfoNode", () => {
    it("returns null when there is nothing to show", () => {
        assert.equal(buildInfoNode(null), null);
        assert.equal(buildInfoNode({ signature: "", docstring: "" }), null);
    });
    it("renders the signature and docstring into a bounded node", () => {
        const node = buildInfoNode({ signature: "f(x)", docstring: "does f" });
        assert.notEqual(node, null);
        assert.ok(node?.textContent?.includes("f(x)"));
        assert.ok(node?.textContent?.includes("does f"));
    });
});

describe("makeReplCompletionSource", () => {
    it("returns null before the session is initialized", () => {
        const source = makeReplCompletionSource(backend({ isInitialized: false }));
        assert.equal(source(makeContext("sup", 3)), null);
    });

    it("offers backend completions (variables AND functions) anchored at the word start", () => {
        const source = makeReplCompletionSource(backend());
        const result = source(makeContext("sup", 3));
        assert.equal(result?.from, 0);
        assert.deepEqual(
            result?.options.map((o) => o.label),
            ["supercell", "create_supercell"],
        );
        assert.deepEqual(
            result?.options.map((o) => o.type),
            ["variable", "function"],
        );
    });

    it("does not pop up on an empty prefix unless explicit", () => {
        const source = makeReplCompletionSource(backend());
        assert.equal(source(makeContext("", 0)), null);
        assert.equal(source(makeContext("", 0, true))?.options.length, 2);
    });

    it("DOES pop up after a dot (attribute access) even without an explicit request", () => {
        const source = makeReplCompletionSource(backend());
        assert.equal(source(makeContext("material.", 9))?.options.length, 2);
    });

    it("boosts keyword-arg (param) completions and completes them as `name=`", () => {
        const source = makeReplCompletionSource(
            backend({
                complete: () => [
                    { name: "crystal", type: "param" },
                    { name: "abs", type: "function" },
                ],
            }),
        );
        const result = source(makeContext("create_slab(", 12, true));
        const param = result?.options.find((o) => o.label === "crystal");
        const other = result?.options.find((o) => o.label === "abs");
        assert.equal(param?.apply, "crystal=");
        assert.equal(param?.boost, 99);
        assert.equal(other?.boost, 0);
    });

    it("resolves signature/docstring lazily via the info callback", () => {
        let describeCallCount = 0;
        const describe: CompletionBackend["describe"] = (...args) => {
            describeCallCount += 1;
            return backend().describe(...args);
        };
        const source = makeReplCompletionSource(backend({ describe }));
        const result = source(makeContext("sup", 3));
        assert.equal(describeCallCount, 0); // not until the item is highlighted
        const info = result?.options[0].info as (c: unknown) => HTMLElement | null;
        const node = info({});
        assert.equal(describeCallCount, 1);
        assert.ok(node?.textContent?.includes("supercell(x)"));
    });
});
