import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
/** Map Jedi's completion kind to a CodeMirror completion type (drives the popup icon). */
declare const JEDI_TYPE_TO_CODEMIRROR_TYPE: {
    readonly module: "namespace";
    readonly class: "class";
    readonly instance: "variable";
    readonly function: "function";
    readonly method: "method";
    readonly property: "property";
    readonly param: "property";
    readonly path: "text";
    readonly keyword: "keyword";
    readonly statement: "variable";
};
export type JediCompletionType = keyof typeof JEDI_TYPE_TO_CODEMIRROR_TYPE;
export type CodeMirrorCompletionType = (typeof JEDI_TYPE_TO_CODEMIRROR_TYPE)[keyof typeof JEDI_TYPE_TO_CODEMIRROR_TYPE];
/** One completion candidate, as produced by a Python completion backend. */
export interface PythonCompletion {
    name: string;
    /** Whatever kind the Python side reported — hence the fallback in jediTypeToCodeMirrorType. */
    type: string;
}
/** On-demand signature + docstring for a highlighted completion. */
export interface PythonSignatureInfo {
    signature: string;
    docstring: string;
}
/** An interface so the source is testable with a fake, and any Python runtime can back it. */
export interface PythonCompletionBackend {
    isInitialized: boolean;
    complete(source: string, line: number, column: number): PythonCompletion[];
    describe(source: string, line: number, column: number, name: string): PythonSignatureInfo | null;
}
export declare function jediTypeToCodeMirrorType(type: string): CodeMirrorCompletionType;
/**
 * `mat3ra.made.material.Material` → `Material`, so long typed signatures stay readable. Only
 * identifier runs collapse, so `10.0` and `Tuple[int, int, int]` are untouched. Exported for tests.
 */
export declare function shortenQualifiedNames(text: string): string;
/**
 * Hand-rolled DOM, not a React component, because CodeMirror's `info` contract wants a detached node
 * it mounts itself — there is no React tree here, and the node lives outside our ThemeProvider, so
 * inline styles are the only ones that apply.
 */
export declare function buildInfoNode(info: PythonSignatureInfo | null): HTMLElement | null;
/**
 * Completes at the cursor against the LIVE namespace, so the user's own variables show up too.
 * Signature/docstring are deferred to the `info` callback to keep typing responsive.
 */
export declare function makePythonCompletionSource(backend: PythonCompletionBackend): (context: CompletionContext) => CompletionResult | null;
export {};
