import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

import IconByName from "../icon/IconByName";
import type { LifecycleStage, LifecycleStageState, StatusTrackEntry } from "./lifecycleStages";
import { getLifecycleStages } from "./lifecycleStages";

export interface LifecycleTimelineProps {
    stages: LifecycleStage[];
    /** Formats a stage's `at` (unix seconds) for the hover title. */
    formatTimestamp?: (seconds: number) => string;
    /** Hides the labels, leaving icons and connectors. For tight headers. */
    compact?: boolean;
    id?: string;
    className?: string;
}

const STATE_TONE: Record<LifecycleStageState, "primary" | "success" | "error" | "muted"> = {
    done: "success",
    current: "primary",
    upcoming: "muted",
    failed: "error",
    skipped: "muted",
};

function defaultFormatTimestamp(seconds: number): string {
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
export default function LifecycleTimeline({
    stages,
    formatTimestamp = defaultFormatTimestamp,
    compact = false,
    id,
    className,
}: LifecycleTimelineProps) {
    const theme = useTheme();

    const colorFor = (state: LifecycleStageState) => {
        const tone = STATE_TONE[state];
        if (tone === "muted") return theme.palette.text.disabled;

        return theme.palette[tone].main;
    };

    return (
        <Stack
            direction="row"
            alignItems="center"
            id={id}
            className={className}
            role="list"
            aria-label="Job lifecycle"
            sx={{ minWidth: 0 }}>
            {stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                    {index > 0 ? (
                        <Box
                            aria-hidden
                            sx={{
                                width: compact ? 12 : 20,
                                height: 2,
                                mx: 0.5,
                                borderRadius: 1,
                                // The connector belongs to the stage it leads into:
                                // it is "travelled" only once that stage is reached.
                                bgcolor:
                                    stage.state === "upcoming" || stage.state === "skipped"
                                        ? theme.palette.divider
                                        : colorFor(stage.state),
                            }}
                        />
                    ) : null}

                    <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        role="listitem"
                        aria-current={stage.state === "current" ? "step" : undefined}
                        id={id ? `${id}-${stage.id}` : undefined}
                        data-state={stage.state}
                        title={[
                            stage.label,
                            stage.at === undefined ? undefined : formatTimestamp(stage.at),
                        ]
                            .filter(Boolean)
                            .join(" · ")}
                        sx={{ minWidth: 0, opacity: stage.state === "skipped" ? 0.5 : 1 }}>
                        <IconByName
                            name={stage.iconName}
                            fontSize="small"
                            sx={{ color: colorFor(stage.state) }}
                        />
                        {compact ? null : (
                            <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                    color: colorFor(stage.state),
                                    fontWeight: stage.state === "current" ? 600 : 400,
                                }}>
                                {stage.label}
                            </Typography>
                        )}
                    </Stack>
                </React.Fragment>
            ))}
        </Stack>
    );
}

export interface JobLifecycleTimelineProps extends Omit<LifecycleTimelineProps, "stages"> {
    /** A `JobStatus` value, e.g. "pre-submission", "active", "finished". */
    status?: string | null;
    /** `job.statusTrack`. Without it the stages render without timestamps. */
    statusTrack?: StatusTrackEntry[];
}

/** The timeline with its stages derived from a job, mirroring `JobStatusChip`. */
export function JobLifecycleTimeline({
    status,
    statusTrack,
    formatTimestamp,
    compact,
    id,
    className,
}: JobLifecycleTimelineProps) {
    return (
        <LifecycleTimeline
            stages={getLifecycleStages({ status, statusTrack })}
            formatTimestamp={formatTimestamp}
            compact={compact}
            id={id}
            className={className}
        />
    );
}
