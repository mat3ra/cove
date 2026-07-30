import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import IconByName from "../../mui/components/icon/IconByName";
import { showErrorAlert } from "../alerts";
import CodeMirror from "../codemirror";
import { makePythonCompletionSource } from "../codemirror/utils/pythonCompletions";
import ReplConsole from "./ReplConsole";
export var ReplStatus;
(function (ReplStatus) {
    ReplStatus["Loading"] = "loading";
    ReplStatus["Ready"] = "ready";
    ReplStatus["Running"] = "running";
    ReplStatus["Error"] = "error";
})(ReplStatus || (ReplStatus = {}));
const STATUS_LABEL = {
    [ReplStatus.Loading]: "Preparing Python environment…",
    [ReplStatus.Ready]: "Ready",
    [ReplStatus.Running]: "Running…",
    [ReplStatus.Error]: "Error",
};
/**
 * Knows nothing about what the session's namespace contains — domain wiring goes through the hooks.
 * Fills whatever height its parent gives it.
 */
function PythonRepl({ session, show, defaultCode = "", onReady, onBeforeRun, onRunSuccess, }) {
    const theme = useTheme();
    const [status, setStatus] = useState(ReplStatus.Loading);
    const [code, setCode] = useState(defaultCode);
    const [output, setOutput] = useState("");
    const [error, setError] = useState(null);
    const completionSource = useMemo(() => makePythonCompletionSource(session), [session]);
    useEffect(() => {
        if (!show)
            return undefined;
        let cancelled = false;
        (async () => {
            try {
                setOutput("");
                // Stream bootstrap steps so the long first load looks alive.
                await session.load((message) => {
                    if (!cancelled)
                        setOutput((previous) => `${previous}${message}\n`);
                });
                if (cancelled)
                    return;
                onReady === null || onReady === void 0 ? void 0 : onReady();
                setStatus(ReplStatus.Ready);
            }
            catch (loadError) {
                if (cancelled)
                    return;
                setStatus(ReplStatus.Error);
                showErrorAlert(loadError instanceof Error ? loadError.message : String(loadError));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [show, session, onReady]);
    const runCode = useCallback(async () => {
        if (!session.isInitialized || session.isRunning)
            return;
        setStatus(ReplStatus.Running);
        setError(null);
        try {
            onBeforeRun === null || onBeforeRun === void 0 ? void 0 : onBeforeRun();
            const { output: runOutput, ok, error: runError } = await session.execute(code);
            if (runOutput)
                setOutput((previous) => previous + runOutput);
            if (ok) {
                onRunSuccess === null || onRunSuccess === void 0 ? void 0 : onRunSuccess();
                setStatus(ReplStatus.Ready);
            }
            else {
                setError(runError);
                setStatus(ReplStatus.Error);
            }
        }
        catch (runFailure) {
            // Infra-level failure (not a user Python error, which the runner captures structurally).
            setStatus(ReplStatus.Error);
            showErrorAlert(runFailure instanceof Error ? runFailure.message : String(runFailure));
        }
    }, [code, session, onBeforeRun, onRunSuccess]);
    const isBusy = status === ReplStatus.Loading || status === ReplStatus.Running;
    return (React.createElement(Box, { id: "python-repl", sx: { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }, 
        // Capture phase so we intercept Shift/Cmd/Ctrl+Enter BEFORE CodeMirror inserts a newline.
        onKeyDownCapture: (event) => {
            if (event.key === "Enter" && (event.shiftKey || event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                event.stopPropagation();
                runCode();
            }
        } },
        React.createElement(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { p: 1, borderBottom: `1px solid ${theme.palette.grey[800]}` } },
            React.createElement(Typography, { variant: "subtitle2", sx: { flexGrow: 1 } }, "Python REPL"),
            status === ReplStatus.Loading && React.createElement(CircularProgress, { size: 16 }),
            React.createElement(Chip, { size: "small", variant: "outlined", color: status === ReplStatus.Error ? "error" : "default", label: STATUS_LABEL[status] }),
            React.createElement(Button, { id: "python-repl-run", size: "small", variant: "contained", color: "success", disabled: isBusy, onClick: runCode, title: "Run (Shift+Enter)" },
                "Run",
                React.createElement(IconByName, { name: "actions.play", sx: { ml: 0.5 } }))),
        React.createElement(Box, { sx: { flex: "1 1 auto", minHeight: 80, overflowY: "auto" } },
            React.createElement(CodeMirror, { content: code, updateContent: setCode, options: { lineNumbers: true }, theme: "dark", language: "python", 
                // `completions` is typed non-nullable here, but a CM6 source may return null.
                completions: completionSource })),
        React.createElement(ReplConsole, { output: output, error: error, onClear: () => {
                setOutput("");
                setError(null);
            } }),
        React.createElement(Box, { id: "pyodide-plot-target-repl" })));
}
export default PythonRepl;
