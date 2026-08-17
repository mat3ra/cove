/**
 * How a `SegmentedMeter` divides its bar. Extracted so the overflow rule can be
 * asserted: a job that exceeds its quota must not render as a full bar
 * indistinguishable from one that exactly fills it.
 */
export function getMeterGeometry({ values, total }) {
    const clamped = values.map((value) => Math.max(value, 0));
    const used = clamped.reduce((sum, value) => sum + value, 0);
    // On overflow the bar rescales to the larger total rather than clipping, so
    // the segments keep their proportions to each other and the caption can say
    // by how much the quota was exceeded.
    const scale = Math.max(total, used) || 1;
    return {
        used,
        scale,
        isOverflowing: used > total && total > 0,
        widths: clamped.map((value) => (value / scale) * 100),
    };
}
