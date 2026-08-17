import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import IconByName from "../icon/IconByName";
import { getLifecycleStages } from "./lifecycleStages";
const STATE_TONE = {
    done: "success",
    current: "primary",
    upcoming: "muted",
    failed: "error",
    skipped: "muted",
};
function defaultFormatTimestamp(seconds) {
    // Unix seconds is what `statusTrack` carries; Date wants milliseconds.
    return new Date(seconds * 1000).toLocaleString();
}
/**
 * Where a job is in its life, and how it got there.
 *
 * Replaces a single status-tinted icon, which had to carry "queued", "running"
 * and "errored" alike and could say nothing about what had already happened or
 * what was still to come. Each stage keeps its own icon, so the sequence reads
 * without relying on colour, and carries its timestamp from the status track.
 *
 * A failed job does not show a finish it never reached: the last stage becomes
 * the failure itself, and anything the job never got to renders as skipped
 * rather than merely pending.
 */
export default function LifecycleTimeline({ stages, formatTimestamp = defaultFormatTimestamp, compact = false, id, className, }) {
    const theme = useTheme();
    const colorFor = (state) => {
        const tone = STATE_TONE[state];
        if (tone === "muted")
            return theme.palette.text.disabled;
        return theme.palette[tone].main;
    };
    return (React.createElement(Stack, { direction: "row", alignItems: "center", id: id, className: className, role: "list", "aria-label": "Job lifecycle", sx: { minWidth: 0 } }, stages.map((stage, index) => (React.createElement(React.Fragment, { key: stage.id },
        index > 0 ? (React.createElement(Box, { "aria-hidden": true, sx: {
                width: compact ? 12 : 20,
                height: 2,
                mx: 0.5,
                borderRadius: 1,
                // The connector belongs to the stage it leads into:
                // it is "travelled" only once that stage is reached.
                bgcolor: stage.state === "upcoming" || stage.state === "skipped"
                    ? theme.palette.divider
                    : colorFor(stage.state),
            } })) : null,
        React.createElement(Stack, { direction: "row", spacing: 0.5, alignItems: "center", role: "listitem", "aria-current": stage.state === "current" ? "step" : undefined, id: id ? `${id}-${stage.id}` : undefined, "data-state": stage.state, title: [
                stage.label,
                stage.at === undefined ? undefined : formatTimestamp(stage.at),
            ]
                .filter(Boolean)
                .join(" · "), sx: { minWidth: 0, opacity: stage.state === "skipped" ? 0.5 : 1 } },
            React.createElement(IconByName, { name: stage.iconName, fontSize: "small", sx: { color: colorFor(stage.state) } }),
            compact ? null : (React.createElement(Typography, { variant: "caption", noWrap: true, sx: {
                    color: colorFor(stage.state),
                    fontWeight: stage.state === "current" ? 600 : 400,
                } }, stage.label))))))));
}
/** The timeline with its stages derived from a job, mirroring `JobStatusChip`. */
export function JobLifecycleTimeline({ status, statusTrack, formatTimestamp, compact, id, className, }) {
    return (React.createElement(LifecycleTimeline, { stages: getLifecycleStages({ status, statusTrack }), formatTimestamp: formatTimestamp, compact: compact, id: id, className: className }));
}
