import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
const TONE_COLOR = {
    default: "text.primary",
    warning: "warning.main",
    error: "error.main",
};
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
export default function MetricTile({ label, value, unit, caption, tone = "default", size = "medium", id, className, }) {
    const isKnown = value !== undefined && value !== null && value !== "";
    return (React.createElement(Box, { id: id, className: className, sx: { minWidth: 0 } },
        React.createElement(Typography, { variant: "caption", color: "text.secondary", sx: { textTransform: "uppercase", letterSpacing: ".06em", display: "block" } }, label),
        React.createElement(Stack, { direction: "row", spacing: 0.5, alignItems: "baseline" },
            React.createElement(Typography, { variant: size === "small" ? "subtitle2" : "h6", component: "span", color: isKnown ? TONE_COLOR[tone] : "text.disabled", noWrap: true }, isKnown ? value : "—"),
            isKnown && unit ? (React.createElement(Typography, { variant: "caption", component: "span", color: "text.secondary" }, unit)) : null),
        caption ? (React.createElement(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block" } }, caption)) : null));
}
