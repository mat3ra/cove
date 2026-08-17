import React from "react";
import type { LifecycleStage, StatusTrackEntry } from "./lifecycleStages";
export interface LifecycleTimelineProps {
    stages: LifecycleStage[];
    /** Formats a stage's `at` (unix seconds) for the hover title. */
    formatTimestamp?: (seconds: number) => string;
    /** Hides the labels, leaving icons and connectors. For tight headers. */
    compact?: boolean;
    id?: string;
    className?: string;
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
export default function LifecycleTimeline({ stages, formatTimestamp, compact, id, className, }: LifecycleTimelineProps): React.JSX.Element;
export interface JobLifecycleTimelineProps extends Omit<LifecycleTimelineProps, "stages"> {
    /** A `JobStatus` value, e.g. "pre-submission", "active", "finished". */
    status?: string | null;
    /** `job.statusTrack`. Without it the stages render without timestamps. */
    statusTrack?: StatusTrackEntry[];
}
/** The timeline with its stages derived from a job, mirroring `JobStatusChip`. */
export declare function JobLifecycleTimeline({ status, statusTrack, formatTimestamp, compact, id, className, }: JobLifecycleTimelineProps): React.JSX.Element;
