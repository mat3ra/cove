import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
import IconByName from "../icon/IconByName";
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
export default function SelectableCard({ title, subtitle, selected = false, disabled = false, onSelect, badge, children, disabledReason, id, className, }) {
    return (React.createElement(ButtonBase, { id: id, className: className, role: "radio", "aria-checked": selected, disabled: disabled, onClick: onSelect, sx: {
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
        } },
        React.createElement(Stack, { direction: "row", spacing: 1, alignItems: "flex-start" },
            React.createElement(Box, { sx: { flexGrow: 1, minWidth: 0 } },
                React.createElement(Stack, { direction: "row", spacing: 0.75, alignItems: "center" },
                    selected ? (React.createElement(IconByName, { name: "shapes.check", fontSize: "small", sx: { color: "primary.main" } })) : null,
                    React.createElement(Typography, { variant: "subtitle2", noWrap: true }, title)),
                disabled && disabledReason ? (React.createElement(Typography, { variant: "caption", color: "text.disabled", display: "block" }, disabledReason)) : (subtitle && (React.createElement(Typography, { variant: "caption", color: "text.secondary", display: "block" }, subtitle)))),
            badge ? React.createElement(Box, { sx: { flexShrink: 0 } }, badge) : null),
        children ? (React.createElement(Box, { sx: { mt: 1.25, pt: 1.25, borderTop: "1px solid", borderColor: "divider" } }, children)) : null));
}
/**
 * Wraps a set of `SelectableCard`s so assistive tech hears one choice rather
 * than a pile of unrelated radios.
 */
export function SelectableCardGroup({ label, children, id }) {
    return (React.createElement(Stack, { role: "radiogroup", "aria-label": label, id: id, spacing: 1 }, children));
}
