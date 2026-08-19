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
import type { PythonError } from "../pyodide/PyodideSession";

export interface ReplRequirements {
    content: string;
    profile: string;
    profiles: string[];
    onApply: (
        content: string,
        profile: string,
        onProgress: (message: string) => void,
    ) => Promise<void>;
}

export interface ReplConsoleProps {
    output: string;
    error: PythonError | null;
    onClear: () => void;
    requirements?: ReplRequirements;
    busy?: boolean;
    onApplyRequirements?: (content: string, profile: string) => Promise<void>;
}

const ERROR_BACKGROUND_OPACITY = 0.08;

const EXPANDED_CONSOLE_FLEX = "1 1 40%";

const COLLAPSED_CONSOLE_FLEX = "0 0 auto";

function ErrorBlock({ error }: { error: PythonError }) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                mt: 1,
                p: 1,
                borderLeft: `3px solid ${theme.palette.error.main}`,
                background: alpha(theme.palette.error.main, ERROR_BACKGROUND_OPACITY),
            }}>
            <Box
                component="div"
                sx={{ color: theme.palette.error.main, fontWeight: 700, whiteSpace: "pre-wrap" }}>
                {error.ename}: {error.evalue}
            </Box>
            {error.traceback && (
                <Box
                    component="details"
                    open
                    sx={{
                        mt: 0.5,
                        "& summary": {
                            cursor: "pointer",
                            color: theme.palette.text.secondary,
                            fontSize: "0.72rem",
                        },
                    }}>
                    <Box component="summary">Traceback</Box>
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            mt: 0.5,
                            whiteSpace: "pre-wrap",
                            color: theme.palette.error.light,
                        }}>
                        {error.traceback}
                    </Box>
                </Box>
            )}
        </Box>
    );
}

/** Owns only its collapsed/expanded state; sizing is the parent's job. */
function ReplConsole({
    output,
    error,
    onClear,
    requirements,
    busy = false,
    onApplyRequirements,
}: ReplConsoleProps) {
    const theme = useTheme();
    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState<"console" | "requirements">("console");
    const [requirementsContent, setRequirementsContent] = useState(requirements?.content || "");
    const [profile, setProfile] = useState(requirements?.profile || "");
    const bodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => setRequirementsContent(requirements?.content || ""), [requirements?.content]);
    useEffect(() => setProfile(requirements?.profile || ""), [requirements?.profile]);

    useEffect(() => {
        const body = bodyRef.current;
        if (open && body) body.scrollTop = body.scrollHeight;
    }, [output, error, open]);

    const hasContent = Boolean(output) || Boolean(error);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                // Take a share of the panel when open; shrink to just the header bar when collapsed.
                flex: open ? EXPANDED_CONSOLE_FLEX : COLLAPSED_CONSOLE_FLEX,
                borderTop: `1px solid ${theme.palette.grey[800]}`,
            }}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1, py: 0.25 }}>
                <IconButton size="small" onClick={() => setOpen((v) => !v)} sx={{ p: 0.25 }}>
                    <IconByName name={open ? "actions.collapse" : "actions.expand"} />
                </IconButton>
                <Tabs
                    value={tab}
                    onChange={(_event, value) => {
                        setTab(value);
                        setOpen(true);
                    }}
                    sx={{ flexGrow: 1, minHeight: 28 }}>
                    <Tab
                        value="console"
                        label={error ? `Console · ${error.ename}` : "Console"}
                        sx={{ minHeight: 28, py: 0, px: 1, fontSize: "0.72rem" }}
                    />
                    {requirements && (
                        <Tab
                            value="requirements"
                            label="Requirements"
                            sx={{ minHeight: 28, py: 0, px: 1, fontSize: "0.72rem" }}
                        />
                    )}
                </Tabs>
                {tab === "console" && (
                    <Button size="small" color="secondary" disabled={!hasContent} onClick={onClear}>
                        Clear
                    </Button>
                )}
            </Stack>
            {open && tab === "console" && (
                <Box
                    ref={bodyRef}
                    id="python-repl-output"
                    sx={{
                        flex: "1 1 auto",
                        minHeight: 0,
                        overflowY: "auto",
                        px: 1,
                        pb: 1,
                        fontFamily: commonSettings.fonts.monospace,
                        fontSize: "0.78rem",
                        lineHeight: 1.5,
                    }}>
                    {output && (
                        <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
                            {output}
                        </Box>
                    )}
                    {error && <ErrorBlock error={error} />}
                    {!hasContent && (
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                            Output and errors appear here.
                        </Typography>
                    )}
                </Box>
            )}
            {open && tab === "requirements" && requirements && (
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, py: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            Profile
                        </Typography>
                        <Select
                            size="small"
                            value={profile}
                            onChange={(event) => setProfile(event.target.value)}
                            sx={{ minWidth: 140, height: 28, fontSize: "0.75rem" }}>
                            {requirements.profiles.map((name) => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            size="small"
                            color="secondary"
                            disabled={busy || requirementsContent === requirements.content}
                            onClick={() => setRequirementsContent(requirements.content)}>
                            Reset
                        </Button>
                        <Button
                            id="python-repl-install-requirements"
                            size="small"
                            variant="contained"
                            disabled={busy || !profile || !onApplyRequirements}
                            onClick={() => onApplyRequirements?.(requirementsContent, profile)}>
                            Install
                        </Button>
                    </Stack>
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                        <CodeMirror
                            content={requirementsContent}
                            updateContent={setRequirementsContent}
                            options={{ lineNumbers: true }}
                            theme={theme.palette.mode}
                            language="text"
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default ReplConsole;
