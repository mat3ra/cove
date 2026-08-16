import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

import IconByName from "../icon/IconByName";

export interface SelectableCardProps {
    /** The thing being chosen. Shown first and largest. */
    title: React.ReactNode;
    /** One line under the title — what distinguishes this option from its neighbours. */
    subtitle?: React.ReactNode;
    selected?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
    /** Top-right slot: a `StatusChip`, a price, a queue badge. */
    badge?: React.ReactNode;
    /** Facts below the divider — a row of `MetricTile`s reads well here. */
    children?: React.ReactNode;
    /** Why this option cannot be chosen. Shown in place of the subtitle when disabled. */
    disabledReason?: string;
    id?: string;
    className?: string;
}

/**
 * One option in a set, presented as a card rather than a row in a dropdown.
 *
 * A dropdown shows one option at a time and hides everything that would let a
 * reader choose between them — a cluster's queue, its price, whether it is busy.
 * Cards trade vertical space for a comparison the reader can actually make.
 *
 * Renders as a `radio`, not a button: a set of these is a single choice, so
 * screen readers should hear it as one, and the selected card carries
 * `aria-checked` rather than relying on the border colour.
 */
export default function SelectableCard({
    title,
    subtitle,
    selected = false,
    disabled = false,
    onSelect,
    badge,
    children,
    disabledReason,
    id,
    className,
}: SelectableCardProps) {
    return (
        <ButtonBase
            id={id}
            className={className}
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={onSelect}
            sx={{
                display: "block",
                width: "100%",
                textAlign: "left",
                p: 1.5,
                borderRadius: 1,
                border: "1px solid",
                // Two pixels of border on the selected card would shift the layout
                // by one; an inset shadow thickens the edge without moving anything.
                borderColor: selected ? "primary.main" : "divider",
                boxShadow: selected
                    ? (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}`
                    : "none",
                bgcolor: selected ? "action.selected" : "background.paper",
                opacity: disabled ? 0.6 : 1,
                "&:hover": { bgcolor: disabled ? undefined : "action.hover" },
                "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main" },
            }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        {selected ? (
                            <IconByName
                                name="shapes.check"
                                fontSize="small"
                                sx={{ color: "primary.main" }}
                            />
                        ) : null}
                        <Typography variant="subtitle2" noWrap>
                            {title}
                        </Typography>
                    </Stack>
                    {disabled && disabledReason ? (
                        <Typography variant="caption" color="text.disabled" display="block">
                            {disabledReason}
                        </Typography>
                    ) : (
                        subtitle && (
                            <Typography variant="caption" color="text.secondary" display="block">
                                {subtitle}
                            </Typography>
                        )
                    )}
                </Box>
                {badge ? <Box sx={{ flexShrink: 0 }}>{badge}</Box> : null}
            </Stack>

            {children ? (
                <Box sx={{ mt: 1.25, pt: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
                    {children}
                </Box>
            ) : null}
        </ButtonBase>
    );
}

export interface SelectableCardGroupProps {
    /** Names the choice for screen readers, e.g. "Cluster". */
    label: string;
    children: React.ReactNode;
    id?: string;
}

/**
 * Wraps a set of `SelectableCard`s so assistive tech hears one choice rather
 * than a pile of unrelated radios.
 */
export function SelectableCardGroup({ label, children, id }: SelectableCardGroupProps) {
    return (
        <Stack role="radiogroup" aria-label={label} id={id} spacing={1}>
            {children}
        </Stack>
    );
}
