import React from "react";
import type { PythonError } from "../pyodide/PyodideSession";
export interface ReplConsoleProps {
    /** Accumulated stdout + system log lines (scrollback). */
    output: string;
    /** Structured Python error from the last run, or null. Rendered Jupyter-style. */
    error: PythonError | null;
    /** Clear scrollback + error. */
    onClear: () => void;
}
/**
 * Output console for an in-browser Python REPL: stdout scrollback plus — when the last run failed — a
 * Jupyter/nbformat style error block (bold `ename: evalue` headline + collapsible traceback).
 *
 * Deliberately layout-agnostic and resize-free: it fills whatever height its parent gives it (flex)
 * and only owns its own collapsed/expanded state, so it drops into a drawer, a split pane or a
 * tiling layout without change.
 */
declare function ReplConsole({ output, error, onClear }: ReplConsoleProps): React.JSX.Element;
export default ReplConsole;
