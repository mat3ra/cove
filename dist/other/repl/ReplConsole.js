import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useRef, useState } from "react";
import IconByName from "../../mui/components/icon/IconByName";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
/** Jupyter/nbformat-style error: bold `ename: evalue`, with the cleaned traceback collapsible below. */
function ErrorBlock({ error }) {
    const theme = useTheme();
    return (React.createElement(Box, { sx: {
            mt: 1,
            p: 1,
            borderLeft: `3px solid ${theme.palette.error.main}`,
            background: "rgba(244, 67, 54, 0.08)",
        } },
        React.createElement(Box, { component: "div", sx: { color: theme.palette.error.main, fontWeight: 700, whiteSpace: "pre-wrap" } },
            error.ename,
            ": ",
            error.evalue),
        error.traceback && (React.createElement(Box, { component: "details", open: true, sx: {
                mt: 0.5,
                "& summary": {
                    cursor: "pointer",
                    color: theme.palette.text.secondary,
                    fontSize: "0.72rem",
                },
            } },
            React.createElement(Box, { component: "summary" }, "Traceback"),
            React.createElement(Box, { component: "pre", sx: {
                    m: 0,
                    mt: 0.5,
                    whiteSpace: "pre-wrap",
                    color: theme.palette.error.light,
                } }, error.traceback)))));
}
/**
 * stdout scrollback plus a Jupyter-style error block. Owns only its collapsed/expanded state; sizing
 * is the parent's job, so it works in a drawer, split pane or tile unchanged.
 */
function ReplConsole({ output, error, onClear }) {
    const theme = useTheme();
    const [open, setOpen] = useState(true);
    const bodyRef = useRef(null);
    // Auto-scroll to the newest line whenever output or the error changes.
    useEffect(() => {
        const body = bodyRef.current;
        if (open && body)
            body.scrollTop = body.scrollHeight;
    }, [output, error, open]);
    const hasContent = Boolean(output) || Boolean(error);
    return (React.createElement(Box, { sx: {
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            // Take a share of the panel when open; shrink to just the header bar when collapsed.
            flex: open ? "1 1 40%" : "0 0 auto",
            borderTop: `1px solid ${theme.palette.grey[800]}`,
        } },
        React.createElement(Stack, { direction: "row", alignItems: "center", spacing: 0.5, sx: { px: 1, py: 0.25 } },
            React.createElement(IconButton, { size: "small", onClick: () => setOpen((v) => !v), sx: { p: 0.25 } },
                React.createElement(IconByName, { name: open ? "actions.collapse" : "actions.expand" })),
            React.createElement(Typography, { variant: "caption", sx: { flexGrow: 1, color: theme.palette.text.secondary } },
                "Console",
                error && (React.createElement(Box, { component: "span", sx: { color: theme.palette.error.main, ml: 1 } },
                    "\u25CF ",
                    error.ename))),
            React.createElement(Button, { size: "small", color: "secondary", disabled: !hasContent, onClick: onClear }, "Clear")),
        open && (React.createElement(Box, { ref: bodyRef, id: "python-repl-output", sx: {
                flex: "1 1 auto",
                minHeight: 0,
                overflowY: "auto",
                px: 1,
                pb: 1,
                fontFamily: MONO,
                fontSize: "0.78rem",
                lineHeight: 1.5,
            } },
            output && (React.createElement(Box, { component: "pre", sx: { m: 0, whiteSpace: "pre-wrap" } }, output)),
            error && React.createElement(ErrorBlock, { error: error }),
            !hasContent && (React.createElement(Typography, { variant: "caption", sx: { color: theme.palette.text.disabled } }, "Output and errors appear here."))))));
}
export default ReplConsole;
