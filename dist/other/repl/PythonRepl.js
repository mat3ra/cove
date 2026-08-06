import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const EDITOR_MIN_HEIGHT = 80;
/**
 * Knows nothing about what the session's namespace contains — domain wiring goes through the hooks.
 * Fills whatever height its parent gives it.
 */
function PythonRepl({ session, show, preload = false, defaultCode = "", onReady, onBeforeRun, onRunSuccess, requirements, }) {
    const theme = useTheme();
    const [status, setStatus] = useState(ReplStatus.Loading);
    const [code, setCode] = useState(defaultCode);
    const [output, setOutput] = useState("");
    const [error, setError] = useState(null);
    const completionSource = useMemo(() => makePythonCompletionSource(session), [session]);
    // A ref, not effect deps: an unmemoized callback would otherwise restart the load and wipe output.
    const callbacksRef = useRef({ onReady, onBeforeRun, onRunSuccess });
    callbacksRef.current = { onReady, onBeforeRun, onRunSuccess };
    useEffect(() => {
        if (!show && !preload)
            return undefined;
        let cancelled = false;
        (async () => {
            var _a, _b;
            try {
                setOutput("");
                // Stream bootstrap steps so the long first load looks alive.
                await session.load((message) => {
                    if (!cancelled)
                        setOutput((previous) => `${previous}${message}\n`);
                });
                if (cancelled)
                    return;
                (_b = (_a = callbacksRef.current).onReady) === null || _b === void 0 ? void 0 : _b.call(_a);
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
    }, [preload, show, session]);
    const runCode = useCallback(async () => {
        var _a, _b, _c, _d;
        if (!session.isInitialized || session.isRunning)
            return;
        setStatus(ReplStatus.Running);
        setError(null);
        try {
            (_b = (_a = callbacksRef.current).onBeforeRun) === null || _b === void 0 ? void 0 : _b.call(_a);
            const { output: runOutput, ok, error: runError } = await session.execute(code);
            if (runOutput)
                setOutput((previous) => previous + runOutput);
            if (ok) {
                (_d = (_c = callbacksRef.current).onRunSuccess) === null || _d === void 0 ? void 0 : _d.call(_c);
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
    }, [code, session]);
    const isBusy = status === ReplStatus.Loading || status === ReplStatus.Running;
    const applyRequirements = useCallback(async (content, profile) => {
        if (!requirements || isBusy)
            return;
        setStatus(ReplStatus.Running);
        setError(null);
        try {
            await requirements.onApply(content, profile, (message) => setOutput((previous) => `${previous}${message}\n`));
            setStatus(ReplStatus.Ready);
        }
        catch (installError) {
            setStatus(ReplStatus.Error);
            showErrorAlert(installError instanceof Error ? installError.message : String(installError));
        }
    }, [isBusy, requirements]);
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
        React.createElement(Box, { sx: { flex: "1 1 auto", minHeight: EDITOR_MIN_HEIGHT, overflowY: "auto" } },
            React.createElement(CodeMirror, { content: code, updateContent: setCode, options: { lineNumbers: true }, theme: theme.palette.mode, language: "python", 
                // `completions` is typed non-nullable here, but a CM6 source may return null.
                completions: completionSource })),
        React.createElement(ReplConsole, { output: output, error: error, onClear: () => {
                setOutput("");
                setError(null);
            }, requirements: requirements, busy: isBusy, onApplyRequirements: applyRequirements }),
        React.createElement(Box, { id: "pyodide-plot-target-repl" })));
}
export default PythonRepl;
