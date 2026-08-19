import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    type PythonCompletionBackend,
    buildInfoNode,
    jediTypeToCodeMirrorType,
    makePythonCompletionSource,
    shortenQualifiedNames,
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

const backend = (over: Partial<PythonCompletionBackend> = {}): PythonCompletionBackend => ({
    isInitialized: true,
    complete: () => [
        { name: "supercell", type: "instance" },
        { name: "create_supercell", type: "function" },
    ],
    describe: (_s, _l, _c, name) => ({ signature: `${name}(x)`, docstring: `doc for ${name}` }),
    ...over,
});

describe("shortenQualifiedNames", () => {
    it("collapses a dotted module path to the class name", () => {
        assert.equal(shortenQualifiedNames("mat3ra.made.material.Material"), "Material");
    });

    it("collapses every qualified name inside a Union", () => {
        assert.equal(
            shortenQualifiedNames(
                "crystal: Union[mat3ra.made.material.Material, " +
                    "mat3ra.made.tools.build_components.metadata.material_with_build_metadata.MaterialWithBuildMetadata]",
            ),
            "crystal: Union[Material, MaterialWithBuildMetadata]",
        );
    });

    it("leaves numeric literals and plain generics untouched", () => {
        assert.equal(shortenQualifiedNames("vacuum: float = 10.0"), "vacuum: float = 10.0");
        assert.equal(
            shortenQualifiedNames("miller_indices: Tuple[int, int, int] = (0, 0, 1)"),
            "miller_indices: Tuple[int, int, int] = (0, 0, 1)",
        );
    });

    it("collapses a qualified type inside Optional", () => {
        assert.equal(
            shortenQualifiedNames(
                "termination_top: Optional[mat3ra.made.tools.build_components.entities.auxiliary.two_dimensional.termination.Termination] = None",
            ),
            "termination_top: Optional[Termination] = None",
        );
    });
});

describe("jediTypeToCodeMirrorType", () => {
    it("maps Jedi kinds to CodeMirror completion types", () => {
        assert.equal(jediTypeToCodeMirrorType("function"), "function");
        assert.equal(jediTypeToCodeMirrorType("instance"), "variable");
        assert.equal(jediTypeToCodeMirrorType("module"), "namespace");
        assert.equal(jediTypeToCodeMirrorType("keyword"), "keyword");
    });
    it("falls back to 'variable' for unknown kinds", () => {
        assert.equal(jediTypeToCodeMirrorType("weird"), "variable");
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

describe("makePythonCompletionSource", () => {
    it("returns null before the session is initialized", () => {
        const source = makePythonCompletionSource(backend({ isInitialized: false }));
        assert.equal(source(makeContext("sup", 3)), null);
    });

    it("offers backend completions (variables AND functions) anchored at the word start", () => {
        const source = makePythonCompletionSource(backend());
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
        const source = makePythonCompletionSource(backend());
        assert.equal(source(makeContext("", 0)), null);
        assert.equal(source(makeContext("", 0, true))?.options.length, 2);
    });

    it("DOES pop up after a dot (attribute access) even without an explicit request", () => {
        const source = makePythonCompletionSource(backend());
        assert.equal(source(makeContext("material.", 9))?.options.length, 2);
    });

    it("boosts keyword-arg (param) completions and completes them as `name=`", () => {
        const source = makePythonCompletionSource(
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
        const describe: PythonCompletionBackend["describe"] = (...args) => {
            describeCallCount += 1;
            return backend().describe(...args);
        };
        const source = makePythonCompletionSource(backend({ describe }));
        const result = source(makeContext("sup", 3));
        assert.equal(describeCallCount, 0); // not until the item is highlighted
        const info = result?.options[0].info as (c: unknown) => HTMLElement | null;
        const node = info({});
        assert.equal(describeCallCount, 1);
        assert.ok(node?.textContent?.includes("supercell(x)"));
    });
});
