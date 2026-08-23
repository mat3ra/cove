import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

import { getMeterGeometry } from "./meterGeometry";

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
export default function SegmentedMeter({
    label,
    segments,
    total,
    caption,
    height = 8,
    id,
    className,
}: SegmentedMeterProps) {
    const { widths, isOverflowing } = getMeterGeometry({
        values: segments.map((segment) => segment.value),
        total,
    });

    return (
        <Box id={id} className={className}>
            {label || caption ? (
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="baseline"
                    sx={{ mb: 0.5 }}>
                    {label ? (
                        <Typography variant="caption" color="text.secondary">
                            {label}
                        </Typography>
                    ) : (
                        <span />
                    )}
                    {caption ? (
                        <Typography
                            variant="caption"
                            color={isOverflowing ? "error.main" : "text.secondary"}>
                            {caption}
                        </Typography>
                    ) : null}
                </Stack>
            ) : null}

            <Stack
                direction="row"
                role="img"
                aria-label={[label, caption].filter(Boolean).join(": ")}
                sx={{
                    height,
                    borderRadius: height / 2,
                    overflow: "hidden",
                    bgcolor: "action.hover",
                }}>
                {segments.map((segment, index) => (
                    <Box
                        key={segment.label}
                        title={`${segment.label}: ${segment.value}`}
                        sx={{
                            width: `${widths[index]}%`,
                            bgcolor: segment.color,
                            backgroundImage: segment.isProjected
                                ? "repeating-linear-gradient(45deg, rgba(255,255,255,.45) 0 3px, transparent 3px 6px)"
                                : undefined,
                        }}
                    />
                ))}
            </Stack>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                {segments.map((segment) => (
                    <Stack
                        key={segment.label}
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "2px",
                                bgcolor: segment.color,
                                backgroundImage: segment.isProjected
                                    ? "repeating-linear-gradient(45deg, rgba(255,255,255,.45) 0 2px, transparent 2px 4px)"
                                    : undefined,
                                flexShrink: 0,
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {segment.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
}
