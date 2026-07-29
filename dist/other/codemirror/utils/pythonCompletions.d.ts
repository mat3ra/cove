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
/** The Jedi completion kinds we know how to map. Derived from the map so the two can't drift. */
export type JediCompletionType = keyof typeof JEDI_TYPE_TO_CODEMIRROR_TYPE;
/** The CodeMirror completion types reachable from the map above. */
export type CodeMirrorCompletionType = (typeof JEDI_TYPE_TO_CODEMIRROR_TYPE)[keyof typeof JEDI_TYPE_TO_CODEMIRROR_TYPE];
/** One completion candidate, as produced by a Python completion backend. */
export interface PythonCompletion {
    name: string;
    /**
     * Jedi's kind for this candidate. Typed as a plain `string`, not {@link JediCompletionType},
     * because it crosses an untyped boundary (it's whatever the Python side reported) — which is
     * exactly why {@link jediTypeToCodeMirrorType} falls back instead of switching exhaustively.
     */
    type: string;
}
/** On-demand signature + docstring for a highlighted completion. */
export interface PythonSignatureInfo {
    signature: string;
    docstring: string;
}
/**
 * The backend a Python completion source needs. Keeping it an interface makes the source unit-testable
 * with a fake backend, and lets any in-process Python runtime (Pyodide or otherwise) plug in as long as
 * it can complete/describe at a source position.
 */
export interface PythonCompletionBackend {
    isInitialized: boolean;
    complete(source: string, line: number, column: number): PythonCompletion[];
    describe(source: string, line: number, column: number, name: string): PythonSignatureInfo | null;
}
export declare function jediTypeToCodeMirrorType(type: string): CodeMirrorCompletionType;
/**
 * Collapse fully-qualified dotted names to their last segment so long typed signatures read well —
 * e.g. `mat3ra.made.material.Material` → `Material`, and
 * `Union[a.b.Material, c.d.MaterialWithBuildMetadata]` → `Union[Material, MaterialWithBuildMetadata]`.
 *
 * Only runs of identifier segments are collapsed (each must start with a letter/underscore), so
 * numeric literals like `10.0` and generics like `Tuple[int, int, int]` are left untouched.
 *
 * Exported for tests only — not part of the package's public API (see ../index.ts).
 */
export declare function shortenQualifiedNames(text: string): string;
/**
 * Build the info-popup content for a highlighted completion: the signature in a wrapped monospace
 * block, the docstring as readable prose below it. Returns null when there's nothing to show.
 *
 * This is hand-rolled DOM rather than a React component (which would be the house style) because
 * CodeMirror's completion `info` contract hands back a detached DOM node that CM mounts itself —
 * there is no React tree to render into. Styles are inline for the same reason: the node lives outside
 * our MUI ThemeProvider, so `sx`/theme lookups would not resolve.
 */
export declare function buildInfoNode(info: PythonSignatureInfo | null): HTMLElement | null;
/**
 * A CodeMirror 6 completion source backed by Jedi (via {@link PythonCompletionBackend}). It completes
 * at the cursor against the live namespace, so it offers the user's own variables and attributes as
 * well as any pre-imported helpers — and defers signature/docstring to an on-demand `info` callback so
 * typing stays responsive.
 */
export declare function makePythonCompletionSource(backend: PythonCompletionBackend): (context: CompletionContext) => CompletionResult | null;
export {};
