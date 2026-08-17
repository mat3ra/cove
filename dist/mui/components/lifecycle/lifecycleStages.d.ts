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
"done"
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
export interface StatusTrackEntry {
    status: string;
    trackedAt: number;
}
export interface LifecycleStagesOptions {
    status?: string | null;
    /** `job.statusTrack` — order does not matter; the earliest entry per stage wins. */
    statusTrack?: StatusTrackEntry[];
}
export declare function getLifecycleStages({ status, statusTrack, }: LifecycleStagesOptions): LifecycleStage[];
