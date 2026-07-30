import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";

/** Map Jedi's completion kind to a CodeMirror completion type (drives the popup icon). */
const JEDI_TYPE_TO_CODEMIRROR_TYPE = {
    module: "namespace",
    class: "class",
    instance: "variable",
    function: "function",
    method: "method",
    property: "property",
    param: "property",
    path: "text",
    keyword: "keyword",
    statement: "variable",
} as const;

export type JediCompletionType = keyof typeof JEDI_TYPE_TO_CODEMIRROR_TYPE;

export type CodeMirrorCompletionType =
    (typeof JEDI_TYPE_TO_CODEMIRROR_TYPE)[keyof typeof JEDI_TYPE_TO_CODEMIRROR_TYPE];

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
    describe(
        source: string,
        line: number,
        column: number,
        name: string,
    ): PythonSignatureInfo | null;
}

export function jediTypeToCodeMirrorType(type: string): CodeMirrorCompletionType {
    return JEDI_TYPE_TO_CODEMIRROR_TYPE[type as JediCompletionType] ?? "variable";
}

/**
 * `mat3ra.made.material.Material` → `Material`, so long typed signatures stay readable. Only
 * identifier runs collapse, so `10.0` and `Tuple[int, int, int]` are untouched. Exported for tests.
 */
export function shortenQualifiedNames(text: string): string {
    return text.replace(/(?:[A-Za-z_]\w*\.)+([A-Za-z_]\w*)/g, "$1");
}

/**
 * Hand-rolled DOM, not a React component, because CodeMirror's `info` contract wants a detached node
 * it mounts itself — there is no React tree here, and the node lives outside our ThemeProvider, so
 * inline styles are the only ones that apply.
 */
export function buildInfoNode(info: PythonSignatureInfo | null): HTMLElement | null {
    if (!info || (!info.signature && !info.docstring)) return null;
    const root = document.createElement("div");
    root.style.maxWidth = "460px";
    root.style.maxHeight = "320px";
    root.style.overflow = "auto";

    if (info.signature) {
        const signatureNode = document.createElement("div");
        signatureNode.textContent = shortenQualifiedNames(info.signature);
        signatureNode.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace";
        signatureNode.style.fontSize = "0.85em";
        signatureNode.style.whiteSpace = "pre-wrap";
        signatureNode.style.wordBreak = "break-word";
        if (info.docstring) {
            signatureNode.style.marginBottom = "6px";
            signatureNode.style.paddingBottom = "6px";
            signatureNode.style.borderBottom = "1px solid rgba(128,128,128,0.3)";
        }
        root.appendChild(signatureNode);
    }
    if (info.docstring) {
        const docstringNode = document.createElement("div");
        docstringNode.textContent = info.docstring;
        docstringNode.style.whiteSpace = "pre-wrap";
        root.appendChild(docstringNode);
    }
    return root;
}

/**
 * Completes at the cursor against the LIVE namespace, so the user's own variables show up too.
 * Signature/docstring are deferred to the `info` callback to keep typing responsive.
 */
export function makePythonCompletionSource(backend: PythonCompletionBackend) {
    return (context: CompletionContext): CompletionResult | null => {
        if (!backend.isInitialized) return null;

        const fragment = context.matchBefore(/\w*/);
        if (!fragment) return null;
        // Suppress the popup on an empty prefix unless the char before is `.` (attribute access) or
        // the user explicitly asked (Ctrl+Space).
        const previousCharacter =
            fragment.from > 0
                ? context.state.doc.sliceString(fragment.from - 1, fragment.from)
                : "";
        if (fragment.from === fragment.to && previousCharacter !== "." && !context.explicit)
            return null;

        const source = context.state.doc.toString();
        const lineInfo = context.state.doc.lineAt(context.pos);
        const line = lineInfo.number; // Jedi lines are 1-based
        const column = context.pos - lineInfo.from; // columns 0-based

        let completions: PythonCompletion[];
        try {
            completions = backend.complete(source, line, column);
        } catch {
            return null;
        }
        if (!completions.length) return null;

        const options: Completion[] = completions.map((completion) => {
            const isKeywordArgument = completion.type === "param";
            return {
                label: completion.name,
                type: jediTypeToCodeMirrorType(completion.type),
                detail: completion.type,
                // Rank the current call's keyword args above everything else, and complete them as
                // `name=` so the user lands ready to type the value (IDE-style).
                boost: isKeywordArgument ? 99 : 0,
                apply: isKeywordArgument ? `${completion.name}=` : undefined,
                info: () => buildInfoNode(backend.describe(source, line, column, completion.name)),
            };
        });
        return { from: fragment.from, options, validFor: /^\w*$/ };
    };
}
