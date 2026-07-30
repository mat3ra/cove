import React from "react";
import type { PythonSessionInterface } from "../pyodide/PyodideSession";
export declare enum ReplStatus {
    Loading = "loading",
    Ready = "ready",
    Running = "running",
    Error = "error"
}
export interface PythonReplProps {
    session: PythonSessionInterface;
    /** Bootstraps on first `true`, so the ~30s environment load is paid only when actually shown. */
    show: boolean;
    defaultCode?: string;
    onReady?: () => void;
    onBeforeRun?: () => void;
    onRunSuccess?: () => void;
}
/**
 * Knows nothing about what the session's namespace contains — domain wiring goes through the hooks.
 * Fills whatever height its parent gives it.
 */
declare function PythonRepl({ session, show, defaultCode, onReady, onBeforeRun, onRunSuccess, }: PythonReplProps): React.JSX.Element;
export default PythonRepl;
