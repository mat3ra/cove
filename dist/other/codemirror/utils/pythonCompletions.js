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
};
export function jediTypeToCodeMirrorType(type) {
    var _a;
    return (_a = JEDI_TYPE_TO_CODEMIRROR_TYPE[type]) !== null && _a !== void 0 ? _a : "variable";
}
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
export function shortenQualifiedNames(text) {
    return text.replace(/(?:[A-Za-z_]\w*\.)+([A-Za-z_]\w*)/g, "$1");
}
/**
 * Build the info-popup content for a highlighted completion: the signature in a wrapped monospace
 * block, the docstring as readable prose below it. Returns null when there's nothing to show.
 *
 * This is hand-rolled DOM rather than a React component (which would be the house style) because
 * CodeMirror's completion `info` contract hands back a detached DOM node that CM mounts itself —
 * there is no React tree to render into. Styles are inline for the same reason: the node lives outside
 * our MUI ThemeProvider, so `sx`/theme lookups would not resolve.
 */
export function buildInfoNode(info) {
    if (!info || (!info.signature && !info.docstring))
        return null;
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
 * A CodeMirror 6 completion source backed by Jedi (via {@link PythonCompletionBackend}). It completes
 * at the cursor against the live namespace, so it offers the user's own variables and attributes as
 * well as any pre-imported helpers — and defers signature/docstring to an on-demand `info` callback so
 * typing stays responsive.
 */
export function makePythonCompletionSource(backend) {
    return (context) => {
        if (!backend.isInitialized)
            return null;
        const fragment = context.matchBefore(/\w*/);
        if (!fragment)
            return null;
        // Suppress the popup on an empty prefix unless the char before is `.` (attribute access) or
        // the user explicitly asked (Ctrl+Space).
        const previousCharacter = fragment.from > 0
            ? context.state.doc.sliceString(fragment.from - 1, fragment.from)
            : "";
        if (fragment.from === fragment.to && previousCharacter !== "." && !context.explicit)
            return null;
        const source = context.state.doc.toString();
        const lineInfo = context.state.doc.lineAt(context.pos);
        const line = lineInfo.number; // Jedi lines are 1-based
        const column = context.pos - lineInfo.from; // columns 0-based
        let completions;
        try {
            completions = backend.complete(source, line, column);
        }
        catch (_a) {
            return null;
        }
        if (!completions.length)
            return null;
        const options = completions.map((completion) => {
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
