import React from "react";
export interface MeterSegment {
    /** What this slice is, e.g. "Already used" or "This job". */
    label: string;
    value: number;
    /**
     * Theme path or CSS colour. Segments must also differ in label — colour
     * alone does not distinguish them for every reader.
     */
    color: string;
    /** Draws the slice as a hatch rather than a solid fill: a projection, not a fact. */
    isProjected?: boolean;
}
export interface SegmentedMeterProps {
    /** Names what is being measured, e.g. "Monthly quota". */
    label?: string;
    segments: MeterSegment[];
    /** The whole the segments are parts of. Segments beyond it render as overflow. */
    total: number;
    /** Right-aligned summary, e.g. "436 of 500 core·h left". */
    caption?: React.ReactNode;
    height?: number;
    id?: string;
    className?: string;
}
/**
 * A bar split into named parts of a known whole.
 *
 * A quota is three numbers — what is spent, what this job would spend, what
 * would be left — and a single progress bar can only show one of them. The
 * middle segment is the one that matters at submit time, so it is drawn
 * hatched: it has not happened yet.
 *
 * Overflow is not clamped away. A job that would exceed the quota renders its
 * segment against the bar's full width with the overflow called out, because
 * silently capping the bar at 100% would hide the very thing worth seeing.
 */
export default function SegmentedMeter({ label, segments, total, caption, height, id, className, }: SegmentedMeterProps): React.JSX.Element;
