import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import React, { useEffect, useRef, useState } from "react";
import IconByName from "../../mui/components/icon/IconByName";
import { commonSettings } from "../../theme/theme";
import CodeMirror from "../codemirror";
const ERROR_BACKGROUND_OPACITY = 0.08;
const EXPANDED_CONSOLE_FLEX = "1 1 40%";
const COLLAPSED_CONSOLE_FLEX = "0 0 auto";
function ErrorBlock({ error }) {
    const theme = useTheme();
    return (React.createElement(Box, { sx: {
            mt: 1,
            p: 1,
            borderLeft: `3px solid ${theme.palette.error.main}`,
            background: alpha(theme.palette.error.main, ERROR_BACKGROUND_OPACITY),
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
/** Owns only its collapsed/expanded state; sizing is the parent's job. */
function ReplConsole({ output, error, onClear, requirements, busy = false, onApplyRequirements, }) {
    const theme = useTheme();
    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState("console");
    const [requirementsContent, setRequirementsContent] = useState((requirements === null || requirements === void 0 ? void 0 : requirements.content) || "");
    const [profile, setProfile] = useState((requirements === null || requirements === void 0 ? void 0 : requirements.profile) || "");
    const bodyRef = useRef(null);
    useEffect(() => setRequirementsContent((requirements === null || requirements === void 0 ? void 0 : requirements.content) || ""), [requirements === null || requirements === void 0 ? void 0 : requirements.content]);
    useEffect(() => setProfile((requirements === null || requirements === void 0 ? void 0 : requirements.profile) || ""), [requirements === null || requirements === void 0 ? void 0 : requirements.profile]);
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
            flex: open ? EXPANDED_CONSOLE_FLEX : COLLAPSED_CONSOLE_FLEX,
            borderTop: `1px solid ${theme.palette.grey[800]}`,
        } },
        React.createElement(Stack, { direction: "row", alignItems: "center", spacing: 0.5, sx: { px: 1, py: 0.25 } },
            React.createElement(IconButton, { size: "small", onClick: () => setOpen((v) => !v), sx: { p: 0.25 } },
                React.createElement(IconByName, { name: open ? "actions.collapse" : "actions.expand" })),
            React.createElement(Tabs, { value: tab, onChange: (_event, value) => {
                    setTab(value);
                    setOpen(true);
                }, sx: { flexGrow: 1, minHeight: 28 } },
                React.createElement(Tab, { value: "console", label: error ? `Console · ${error.ename}` : "Console", sx: { minHeight: 28, py: 0, px: 1, fontSize: "0.72rem" } }),
                requirements && (React.createElement(Tab, { value: "requirements", label: "Requirements", sx: { minHeight: 28, py: 0, px: 1, fontSize: "0.72rem" } }))),
            tab === "console" && (React.createElement(Button, { size: "small", color: "secondary", disabled: !hasContent, onClick: onClear }, "Clear"))),
        open && tab === "console" && (React.createElement(Box, { ref: bodyRef, id: "python-repl-output", sx: {
                flex: "1 1 auto",
                minHeight: 0,
                overflowY: "auto",
                px: 1,
                pb: 1,
                fontFamily: commonSettings.fonts.monospace,
                fontSize: "0.78rem",
                lineHeight: 1.5,
            } },
            output && (React.createElement(Box, { component: "pre", sx: { m: 0, whiteSpace: "pre-wrap" } }, output)),
            error && React.createElement(ErrorBlock, { error: error }),
            !hasContent && (React.createElement(Typography, { variant: "caption", sx: { color: theme.palette.text.disabled } }, "Output and errors appear here.")))),
        open && tab === "requirements" && requirements && (React.createElement(Box, { sx: { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 } },
            React.createElement(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { px: 1, py: 0.5 } },
                React.createElement(Typography, { variant: "caption", color: "text.secondary" }, "Profile"),
                React.createElement(Select, { size: "small", value: profile, onChange: (event) => setProfile(event.target.value), sx: { minWidth: 140, height: 28, fontSize: "0.75rem" } }, requirements.profiles.map((name) => (React.createElement(MenuItem, { key: name, value: name }, name)))),
                React.createElement(Box, { sx: { flexGrow: 1 } }),
                React.createElement(Button, { size: "small", color: "secondary", disabled: busy || requirementsContent === requirements.content, onClick: () => setRequirementsContent(requirements.content) }, "Reset"),
                React.createElement(Button, { id: "python-repl-install-requirements", size: "small", variant: "contained", disabled: busy || !profile || !onApplyRequirements, onClick: () => onApplyRequirements === null || onApplyRequirements === void 0 ? void 0 : onApplyRequirements(requirementsContent, profile) }, "Install")),
            React.createElement(Box, { sx: { flex: 1, minHeight: 0, overflowY: "auto" } },
                React.createElement(CodeMirror, { content: requirementsContent, updateContent: setRequirementsContent, options: { lineNumbers: true }, theme: theme.palette.mode, language: "text" }))))));
}
export default ReplConsole;
