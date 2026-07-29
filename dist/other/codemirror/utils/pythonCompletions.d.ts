import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
/** A single completion candidate, as returned by a Python completion backend (e.g. Jedi). */
export interface ReplCompletion {
    name: string;
    type: string;
}
/** On-demand signature + docstring for a highlighted completion. */
export interface ReplDescription {
    signature: string;
    docstring: string;
}
/**
 * The backend a Python completion source needs. Keeping it an interface makes the source
 * unit-testable with a fake backend, and lets any in-process Python runtime (Pyodide, or otherwise)
 * plug in as long as it can complete/describe at a source position.
 */
export interface CompletionBackend {
    isInitialized: boolean;
    complete(source: string, line: number, column: number): ReplCompletion[];
    describe(source: string, line: number, column: number, name: string): ReplDescription | null;
}
export declare function jediTypeToCm(type: string): string;
/**
 * Build the info-popup DOM for a highlighted completion: the signature in a wrapped monospace block,
 * the docstring as readable prose below it. Returns null when there's nothing to show. Rendering as a
 * bounded DOM node (rather than a raw string) is what makes long typed signatures legible.
 */
export declare function buildInfoNode(desc: ReplDescription | null): HTMLElement | null;
/**
 * A CodeMirror 6 completion source backed by Jedi (via {@link CompletionBackend}). It completes at the
 * cursor against the live namespace, so it offers the user's variables and attributes as well as the
 * pre-imported helpers — and defers signature/docstring to an on-demand `info` callback so typing
 * stays responsive.
 */
export declare function makeReplCompletionSource(backend: CompletionBackend): (context: CompletionContext) => CompletionResult | null;
