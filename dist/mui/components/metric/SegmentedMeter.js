import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
import { getMeterGeometry } from "./meterGeometry";
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
export default function SegmentedMeter({ label, segments, total, caption, height = 8, id, className, }) {
    const { widths, isOverflowing } = getMeterGeometry({
        values: segments.map((segment) => segment.value),
        total,
    });
    return (React.createElement(Box, { id: id, className: className },
        label || caption ? (React.createElement(Stack, { direction: "row", justifyContent: "space-between", alignItems: "baseline", sx: { mb: 0.5 } },
            label ? (React.createElement(Typography, { variant: "caption", color: "text.secondary" }, label)) : (React.createElement("span", null)),
            caption ? (React.createElement(Typography, { variant: "caption", color: isOverflowing ? "error.main" : "text.secondary" }, caption)) : null)) : null,
        React.createElement(Stack, { direction: "row", role: "img", "aria-label": [label, caption].filter(Boolean).join(": "), sx: {
                height,
                borderRadius: height / 2,
                overflow: "hidden",
                bgcolor: "action.hover",
            } }, segments.map((segment, index) => (React.createElement(Box, { key: segment.label, title: `${segment.label}: ${segment.value}`, sx: {
                width: `${widths[index]}%`,
                bgcolor: segment.color,
                backgroundImage: segment.isProjected
                    ? "repeating-linear-gradient(45deg, rgba(255,255,255,.45) 0 3px, transparent 3px 6px)"
                    : undefined,
            } })))),
        React.createElement(Stack, { direction: "row", spacing: 1.5, flexWrap: "wrap", useFlexGap: true, sx: { mt: 0.75 } }, segments.map((segment) => (React.createElement(Stack, { key: segment.label, direction: "row", spacing: 0.5, alignItems: "center", sx: { minWidth: 0 } },
            React.createElement(Box, { sx: {
                    width: 8,
                    height: 8,
                    borderRadius: "2px",
                    bgcolor: segment.color,
                    backgroundImage: segment.isProjected
                        ? "repeating-linear-gradient(45deg, rgba(255,255,255,.45) 0 2px, transparent 2px 4px)"
                        : undefined,
                    flexShrink: 0,
                } }),
            React.createElement(Typography, { variant: "caption", color: "text.secondary", noWrap: true }, segment.label)))))));
}
