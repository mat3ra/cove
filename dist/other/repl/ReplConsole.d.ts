import React from "react";
import type { PythonError } from "../pyodide/PyodideSession";
export interface ReplConsoleProps {
    output: string;
    error: PythonError | null;
    onClear: () => void;
}
/**
 * stdout scrollback plus a Jupyter-style error block. Owns only its collapsed/expanded state; sizing
 * is the parent's job, so it works in a drawer, split pane or tile unchanged.
 */
declare function ReplConsole({ output, error, onClear }: ReplConsoleProps): React.JSX.Element;
export default ReplConsole;
