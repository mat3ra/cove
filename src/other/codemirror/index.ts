export { default } from "./CodeMirror";
export * from "./CodeMirror";
export * from "./utils/autocomplete_utils";
// Only the Python completion entry point + its contract types are public API. `buildInfoNode`,
// `jediTypeToCodeMirrorType` and `shortenQualifiedNames` stay module-private (they're exported from
// the module for tests, but deliberately not re-exported here) so we aren't stuck supporting them.
export {
    type CodeMirrorCompletionType,
    type JediCompletionType,
    makePythonCompletionSource,
    type PythonCompletion,
    type PythonCompletionBackend,
    type PythonSignatureInfo,
} from "./utils/pythonCompletions";
