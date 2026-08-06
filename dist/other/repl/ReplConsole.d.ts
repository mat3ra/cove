import React from "react";
import type { PythonError } from "../pyodide/PyodideSession";
export interface ReplRequirements {
    content: string;
    profile: string;
    profiles: string[];
    onApply: (content: string, profile: string, onProgress: (message: string) => void) => Promise<void>;
}
export interface ReplConsoleProps {
    output: string;
    error: PythonError | null;
    onClear: () => void;
    requirements?: ReplRequirements;
    busy?: boolean;
    onApplyRequirements?: (content: string, profile: string) => Promise<void>;
}
/** Owns only its collapsed/expanded state; sizing is the parent's job. */
declare function ReplConsole({ output, error, onClear, requirements, busy, onApplyRequirements, }: ReplConsoleProps): React.JSX.Element;
export default ReplConsole;
