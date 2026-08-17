/**
 * How a `SegmentedMeter` divides its bar. Extracted so the overflow rule can be
 * asserted: a job that exceeds its quota must not render as a full bar
 * indistinguishable from one that exactly fills it.
 */
export interface MeterGeometryInput {
    values: number[];
    total: number;
}
export interface MeterGeometry {
    /** Sum of the segments, negatives ignored. */
    used: number;
    /** What 100% of the bar's width represents — grows past `total` on overflow. */
    scale: number;
    isOverflowing: boolean;
    /** Each segment's share of the bar, as a percentage. */
    widths: number[];
}
export declare function getMeterGeometry({ values, total }: MeterGeometryInput): MeterGeometry;
