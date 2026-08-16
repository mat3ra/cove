import type { StatusToneName } from "../../../theme/palette";
/**
 * How a job status is presented: which palette tone carries it, which icon
 * stands in for it, and what the reader is actually told.
 *
 * This lives in cove so that every surface showing job state — the entity
 * header, a readiness rail, unit rows, a run monitor — agrees. Before it, the
 * mapping was duplicated and the copies had already drifted: `@mat3ra/jode`
 * ships both `JOB_STATUS_CLS()` and a `Job.statusCls` getter, and they disagree
 * about `pre-submission` (`info` vs `default`). Neither covered
 * `terminate-queued`, `timeout` or `deleted` with anything but a default, and
 * neither carried an icon or a human label at all.
 *
 * Status strings are the values of `JobStatus` in `@mat3ra/jode`. They are
 * repeated here rather than imported because cove sits *below* jode in the
 * dependency graph; `tests/jobStatusPresentation.tests.ts` guards the list.
 */
export interface JobStatusPresentation {
    /** Palette tone; resolves to `theme.palette.statusTones[tone]`. */
    tone: StatusToneName;
    /** `IconByName` key. Status is never conveyed by color alone. */
    iconName: string;
    /** Short human label. Not the raw status string. */
    label: string;
}
export declare const JOB_STATUS_PRESENTATION: Record<string, JobStatusPresentation>;
/**
 * Resolves a job status string to its presentation, falling back to a neutral
 * "Unknown" rather than throwing — a status the UI has not seen before should
 * render as an honest unknown, not crash the page that shows it.
 */
export declare function getJobStatusPresentation(status?: string | null): JobStatusPresentation;
