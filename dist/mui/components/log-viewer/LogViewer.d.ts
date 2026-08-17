import React from "react";
export interface LogViewerProps {
    /** The text to show. Lines are split on newlines; trailing blanks are kept. */
    text?: string;
    /** Shown instead of the text when there is none yet. */
    emptyMessage?: string;
    /** Rows to show before the box scrolls. */
    rows?: number;
    /** Names the region for assistive tech, e.g. "Job log". */
    label?: string;
    /**
     * Announce new lines to screen readers as they arrive. Off by default: a log
     * tailing a running job would otherwise read itself aloud continuously.
     */
    isLive?: boolean;
    id?: string;
    className?: string;
}
/**
 * A tail of log output, pinned to the end unless the reader scrolls away.
 *
 * The pinning is the whole point. A log that always jumps to the bottom cannot
 * be read while it is being written, and one that never does makes the reader
 * chase it. This follows until the reader scrolls up — then it stops and offers
 * to resume, so looking at something is never interrupted by an arriving line.
 */
export default function LogViewer({ text, emptyMessage, rows, label, isLive, id, className, }: LogViewerProps): React.JSX.Element;
