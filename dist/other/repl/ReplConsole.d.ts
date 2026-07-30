import React from "react";
import type { PythonError } from "../pyodide/PyodideSession";
export interface ReplConsoleProps {
    output: string;
    error: PythonError | null;
    onClear: () => void;
}
/** Owns only its collapsed/expanded state; sizing is the parent's job. */
declare function ReplConsole({ output, error, onClear }: ReplConsoleProps): React.JSX.Element;
export default ReplConsole;
