import React from "react";
import type { PythonSessionInterface } from "../pyodide/PyodideSession";
/** Lifecycle of the REPL, driving the status chip and the disabled state of Run. */
export declare enum ReplStatus {
    Loading = "loading",
    Ready = "ready",
    Running = "running",
    Error = "error"
}
export interface PythonReplProps {
    /** The Python runtime to drive. A {@link PyodideSession} (or subclass) satisfies this. */
    session: PythonSessionInterface;
    /** Bootstraps on first `true`, so the (slow) environment load is paid only when actually shown. */
    show: boolean;
    /** Initial editor content. */
    defaultCode?: string;
    /** Called once the environment is ready — e.g. to inject inputs into the namespace. */
    onReady?: () => void;
    /** Called immediately before each run — e.g. to refresh injected inputs. */
    onBeforeRun?: () => void;
    /** Called after a run that succeeded — e.g. to collect results out of the namespace. */
    onRunSuccess?: () => void;
}
/**
 * A layout-agnostic, terminal-like Python REPL: editor + Run + status, over a scrollback/error
 * console. Delegates ALL Python work to the injected {@link PythonReplProps.session}, and knows
 * nothing about what that session's namespace contains — domain wiring happens through the
 * `onReady` / `onBeforeRun` / `onRunSuccess` hooks, so this component is reusable as-is.
 *
 * Fills whatever height its parent gives it, so it drops into a drawer, a split pane or a tiling
 * layout unchanged.
 */
declare function PythonRepl({ session, show, defaultCode, onReady, onBeforeRun, onRunSuccess, }: PythonReplProps): React.JSX.Element;
export default PythonRepl;
