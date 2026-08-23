import { getJobStatusPresentation } from "../status/jobStatusPresentation";

/**
 * A job's life as an ordered sequence, derived from its status and status track.
 *
 * The header used to say where a job was with a single tinted icon: one glyph
 * carrying "queued" and "finished" and "errored" alike, with no sense of what
 * had already happened or what was still to come. A reader could not tell a job
 * that had just been submitted from one that had been running for an hour, or
 * see when either happened.
 *
 * Pure, and separate from the component, because the interesting decisions are
 * here rather than in the markup: which stage a status belongs to, what a
 * terminal failure does to the stages after it, and what to show when the job
 * carries no track at all.
 */

export type LifecycleStageState =
    /** Happened; the track says when. */
    | "done"
    /** Where the job is now. */
    | "current"
    /** Not reached yet. */
    | "upcoming"
    /** Reached, and it ended badly here. */
    | "failed"
    /** Skipped — the job ended before getting this far. */
    | "skipped";

export interface LifecycleStage {
    id: string;
    label: string;
    state: LifecycleStageState;
    /** `IconByName` key, from the job-status mapping. */
    iconName: string;
    /** Unix seconds, when the track recorded it. */
    at?: number;
}

/** The statuses that make up each stage of the ordinary path. */
const STAGE_STATUSES: Array<{ id: string; label: string; statuses: string[] }> = [
    { id: "draft", label: "Draft", statuses: ["pre-submission"] },
    { id: "queued", label: "Queued", statuses: ["submitted", "queued"] },
    { id: "running", label: "Running", statuses: ["active"] },
    { id: "finished", label: "Finished", statuses: ["finished"] },
];

/** Statuses that end a job somewhere other than "finished". */
const TERMINAL_FAILURE_STATUSES = new Set([
    "error",
    "terminated",
    "terminate-queued",
    "timeout",
    "deleted",
]);

export interface StatusTrackEntry {
    status: string;
    trackedAt: number;
}

export interface LifecycleStagesOptions {
    status?: string | null;
    /** `job.statusTrack` — order does not matter; the earliest entry per stage wins. */
    statusTrack?: StatusTrackEntry[];
}

function stageIndexForStatus(status?: string | null): number {
    if (!status) return 0;

    return STAGE_STATUSES.findIndex((stage) => stage.statuses.includes(status));
}

/** When the job first entered this stage, from whichever status got it there. */
function firstTimestampForStage(
    stage: { statuses: string[] },
    statusTrack: StatusTrackEntry[],
): number | undefined {
    const times = statusTrack
        .filter((entry) => stage.statuses.includes(entry.status))
        .map((entry) => entry.trackedAt)
        .filter((time) => Number.isFinite(time));

    return times.length ? Math.min(...times) : undefined;
}

function stageMeta(stage: { id: string; label: string; statuses: string[] }) {
    return {
        id: stage.id,
        label: stage.label,
        iconName: getJobStatusPresentation(stage.statuses[0]).iconName,
    };
}

function latestTimestamp(statusTrack: StatusTrackEntry[]): number | undefined {
    const times = statusTrack
        .map((entry) => entry.trackedAt)
        .filter((time) => Number.isFinite(time));

    return times.length ? Math.max(...times) : undefined;
}

export function getLifecycleStages({
    status,
    statusTrack = [],
}: LifecycleStagesOptions): LifecycleStage[] {
    const failed = Boolean(status && TERMINAL_FAILURE_STATUSES.has(status));
    const presentation = getJobStatusPresentation(status);

    // Where the job got to. A failed job stopped wherever the track last saw it,
    // which is not something the status alone can say — "error" is not a stage.
    const reachedIndex = failed
        ? Math.max(
              ...statusTrack.map((entry) => stageIndexForStatus(entry.status)),
              // Nothing in the track is a known stage: assume it at least queued,
              // since a job cannot fail without having been submitted.
              1,
          )
        : stageIndexForStatus(status);

    const currentIndex = reachedIndex < 0 ? 0 : reachedIndex;

    return STAGE_STATUSES.map((stage, index) => {
        const at = firstTimestampForStage(stage, statusTrack);
        const isLast = index === STAGE_STATUSES.length - 1;

        if (failed && isLast) {
            // The last stage is where "Finished" would have been; say what
            // actually happened instead of showing a finish that never came.
            return {
                id: "failed",
                label: presentation.label,
                state: "failed" as const,
                iconName: presentation.iconName,
                at: latestTimestamp(statusTrack),
            };
        }

        if (index < currentIndex) {
            return { ...stageMeta(stage), state: "done" as const, at };
        }
        if (index === currentIndex) {
            return { ...stageMeta(stage), state: "current" as const, at };
        }

        return {
            ...stageMeta(stage),
            state: failed ? ("skipped" as const) : ("upcoming" as const),
            at,
        };
    });
}
