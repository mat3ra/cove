export const JOB_STATUS_PRESENTATION = {
    // Not started. Neutral rather than informational: a draft is an absence of
    // state, not something to tell the reader about. (Resolves the jode
    // divergence noted above in favour of `Job.statusCls`'s "default".)
    "pre-submission": { tone: "neutral", iconName: "actions.edit", label: "Draft" },
    queued: { tone: "info", iconName: "shapes.loop", label: "Queued" },
    submitted: { tone: "primary", iconName: "actions.send", label: "Submitted" },
    active: { tone: "warning", iconName: "actions.play", label: "Running" },
    finished: { tone: "success", iconName: "shapes.check", label: "Finished" },
    "terminate-queued": { tone: "warning", iconName: "actions.pause", label: "Stopping" },
    terminated: { tone: "neutral", iconName: "actions.terminate", label: "Terminated" },
    timeout: { tone: "warning", iconName: "actions.terminate", label: "Timed out" },
    error: { tone: "error", iconName: "actions.cancel", label: "Error" },
    deleted: { tone: "neutral", iconName: "actions.delete", label: "Deleted" },
};
const UNKNOWN_STATUS_PRESENTATION = {
    tone: "neutral",
    iconName: "shapes.circle",
    label: "Unknown",
};
/**
 * Resolves a job status string to its presentation, falling back to a neutral
 * "Unknown" rather than throwing — a status the UI has not seen before should
 * render as an honest unknown, not crash the page that shows it.
 */
export function getJobStatusPresentation(status) {
    var _a;
    if (!status)
        return UNKNOWN_STATUS_PRESENTATION;
    return (_a = JOB_STATUS_PRESENTATION[status]) !== null && _a !== void 0 ? _a : UNKNOWN_STATUS_PRESENTATION;
}
