import React from "react";
import type { StatusToneName } from "../../../theme/palette";
export interface StatusChipProps {
    /** The words the reader gets. Required: status is never color-alone. */
    label: string;
    tone?: StatusToneName;
    /** `IconByName` key. Pass `null` only when the chip sits beside its own icon. */
    iconName?: string | null;
    size?: "small" | "medium";
    id?: string;
    className?: string;
    /** Longer explanation, surfaced as the native tooltip. */
    title?: string;
}
/**
 * A small state pill: tinted background, matching ink, icon plus label.
 *
 * Colors come from `theme.palette.statusTones`, whose contrast is asserted in
 * `tests/palette.tests.ts` — which is what makes this readable in both themes,
 * unlike a chip painted with a raw `success.main`.
 */
export default function StatusChip({ label, tone, iconName, size, id, className, title, }: StatusChipProps): React.JSX.Element;
export interface JobStatusChipProps extends Omit<StatusChipProps, "label" | "tone" | "iconName"> {
    /** A `JobStatus` value, e.g. "pre-submission", "active", "finished". */
    status?: string | null;
    /** Overrides the mapped label; the mapped icon and tone are kept. */
    label?: string;
}
/**
 * `StatusChip` with tone, icon and wording resolved from a job status, so every
 * surface showing job state agrees without repeating the mapping.
 */
export declare function JobStatusChip({ status, label, size, id, className, title, }: JobStatusChipProps): React.JSX.Element;
