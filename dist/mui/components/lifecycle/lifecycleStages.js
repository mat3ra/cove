import { getJobStatusPresentation } from "../status/jobStatusPresentation";
/** The statuses that make up each stage of the ordinary path. */
const STAGE_STATUSES = [
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
function stageIndexForStatus(status) {
    if (!status)
        return 0;
    return STAGE_STATUSES.findIndex((stage) => stage.statuses.includes(status));
}
/** When the job first entered this stage, from whichever status got it there. */
function firstTimestampForStage(stage, statusTrack) {
    const times = statusTrack
        .filter((entry) => stage.statuses.includes(entry.status))
        .map((entry) => entry.trackedAt)
        .filter((time) => Number.isFinite(time));
    return times.length ? Math.min(...times) : undefined;
}
function stageMeta(stage) {
    return {
        id: stage.id,
        label: stage.label,
        iconName: getJobStatusPresentation(stage.statuses[0]).iconName,
    };
}
function latestTimestamp(statusTrack) {
    const times = statusTrack
        .map((entry) => entry.trackedAt)
        .filter((time) => Number.isFinite(time));
    return times.length ? Math.max(...times) : undefined;
}
export function getLifecycleStages({ status, statusTrack = [], }) {
    const failed = Boolean(status && TERMINAL_FAILURE_STATUSES.has(status));
    const presentation = getJobStatusPresentation(status);
    // Where the job got to. A failed job stopped wherever the track last saw it,
    // which is not something the status alone can say — "error" is not a stage.
    const reachedIndex = failed
        ? Math.max(...statusTrack.map((entry) => stageIndexForStatus(entry.status)), 
        // Nothing in the track is a known stage: assume it at least queued,
        // since a job cannot fail without having been submitted.
        1)
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
                state: "failed",
                iconName: presentation.iconName,
                at: latestTimestamp(statusTrack),
            };
        }
        if (index < currentIndex) {
            return { ...stageMeta(stage), state: "done", at };
        }
        if (index === currentIndex) {
            return { ...stageMeta(stage), state: "current", at };
        }
        return {
            ...stageMeta(stage),
            state: failed ? "skipped" : "upcoming",
            at,
        };
    });
}
