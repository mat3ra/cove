import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import React from "react";

import type { StatusTone, StatusToneName } from "../../../theme/palette";
import IconByName from "../icon/IconByName";
import { getJobStatusPresentation } from "./jobStatusPresentation";

/**
 * Used when the surrounding theme predates `palette.statusTones` — a host app
 * may still supply its own theme object. Rendering a legible neutral chip is
 * better than reading `undefined` off the palette and crashing.
 */
const FALLBACK_TONE: StatusTone = {
    color: "#4C4E64",
    background: "rgba(76, 78, 100, 0.10)",
    border: "rgba(76, 78, 100, 0.45)",
};

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
export default function StatusChip({
    label,
    tone = "neutral",
    iconName,
    size = "small",
    id,
    className,
    title,
}: StatusChipProps) {
    const theme = useTheme();
    const toneColors = theme.palette.statusTones?.[tone] ?? FALLBACK_TONE;

    return (
        <Chip
            id={id}
            className={className}
            title={title}
            size={size}
            variant="outlined"
            icon={iconName ? <IconByName name={iconName} fontSize="small" /> : undefined}
            label={label}
            sx={{
                color: toneColors.color,
                backgroundColor: toneColors.background,
                borderColor: toneColors.border,
                fontWeight: 600,
                // MUI colors chip icons from its own palette slots; inherit instead so
                // the icon always matches the tone ink beside it.
                "& .MuiChip-icon": { color: "inherit" },
            }}
        />
    );
}

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
export function JobStatusChip({
    status,
    label,
    size = "small",
    id,
    className,
    title,
}: JobStatusChipProps) {
    const presentation = getJobStatusPresentation(status);

    return (
        <StatusChip
            label={label ?? presentation.label}
            tone={presentation.tone}
            iconName={presentation.iconName}
            size={size}
            id={id}
            className={className}
            title={title}
        />
    );
}
