import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import React from "react";
import IconByName from "../icon/IconByName";
import { getJobStatusPresentation } from "./jobStatusPresentation";
/**
 * Used when the surrounding theme predates `palette.statusTones` — a host app
 * may still supply its own theme object. Rendering a legible neutral chip is
 * better than reading `undefined` off the palette and crashing.
 */
const FALLBACK_TONE = {
    color: "#4C4E64",
    background: "rgba(76, 78, 100, 0.10)",
    border: "rgba(76, 78, 100, 0.45)",
};
/**
 * A small state pill: tinted background, matching ink, icon plus label.
 *
 * Colors come from `theme.palette.statusTones`, whose contrast is asserted in
 * `tests/palette.tests.ts` — which is what makes this readable in both themes,
 * unlike a chip painted with a raw `success.main`.
 */
export default function StatusChip({ label, tone = "neutral", iconName, size = "small", id, className, title, }) {
    var _a, _b;
    const theme = useTheme();
    const toneColors = (_b = (_a = theme.palette.statusTones) === null || _a === void 0 ? void 0 : _a[tone]) !== null && _b !== void 0 ? _b : FALLBACK_TONE;
    return (React.createElement(Chip, { id: id, className: className, title: title, size: size, variant: "outlined", icon: iconName ? React.createElement(IconByName, { name: iconName, fontSize: "small" }) : undefined, label: label, sx: {
            color: toneColors.color,
            backgroundColor: toneColors.background,
            borderColor: toneColors.border,
            fontWeight: 600,
            // MUI colors chip icons from its own palette slots; inherit instead so
            // the icon always matches the tone ink beside it.
            "& .MuiChip-icon": { color: "inherit" },
        } }));
}
/**
 * `StatusChip` with tone, icon and wording resolved from a job status, so every
 * surface showing job state agrees without repeating the mapping.
 */
export function JobStatusChip({ status, label, size = "small", id, className, title, }) {
    const presentation = getJobStatusPresentation(status);
    return (React.createElement(StatusChip, { label: label !== null && label !== void 0 ? label : presentation.label, tone: presentation.tone, iconName: presentation.iconName, size: size, id: id, className: className, title: title }));
}
