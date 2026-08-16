import React from "react";
export interface MetricTileProps {
    /** What is being measured, e.g. "Core-hours". */
    label: string;
    /**
     * The measurement. Pass `undefined` when it is genuinely unknown — the tile
     * renders a dash, which reads as "not known" rather than as zero.
     */
    value?: React.ReactNode;
    /** Unit, set beside the value in smaller type: "core·h", "min", "$". */
    unit?: string;
    /** One line under the value: how it was derived, or what it is measured against. */
    caption?: React.ReactNode;
    /** Draws attention without colour alone — pair with a caption saying why. */
    tone?: "default" | "warning" | "error";
    size?: "small" | "medium";
    id?: string;
    className?: string;
}
/**
 * One number, with what it measures and what it means.
 *
 * Built for panels where several of these sit side by side — a compute estimate
 * is core-hours and price and queue wait, and reading them as a sentence is
 * harder than reading them as a row.
 *
 * An absent value renders as an em dash rather than 0: in an estimate the
 * difference between "we do not know what this costs" and "this costs nothing"
 * is the whole point.
 */
export default function MetricTile({ label, value, unit, caption, tone, size, id, className, }: MetricTileProps): React.JSX.Element;
