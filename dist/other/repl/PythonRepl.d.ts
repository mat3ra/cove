import React from "react";
import type { PythonSessionInterface } from "../pyodide/PyodideSession";
import { type ReplRequirements } from "./ReplConsole";
export declare enum ReplStatus {
    Loading = "loading",
    Ready = "ready",
    Running = "running",
    Error = "error"
}
export interface PythonReplProps {
    session: PythonSessionInterface;
    /** Bootstraps on first `true` unless {@link preload} starts it earlier. */
    show: boolean;
    /** Prepare in the background before the panel opens. Useful for expensive browser runtimes. */
    preload?: boolean;
    defaultCode?: string;
    onReady?: () => void;
    onBeforeRun?: () => void;
    onRunSuccess?: () => void;
    requirements?: ReplRequirements;
}
/**
 * Knows nothing about what the session's namespace contains — domain wiring goes through the hooks.
 * Fills whatever height its parent gives it.
 */
declare function PythonRepl({ session, show, preload, defaultCode, onReady, onBeforeRun, onRunSuccess, requirements, }: PythonReplProps): React.JSX.Element;
export default PythonRepl;
