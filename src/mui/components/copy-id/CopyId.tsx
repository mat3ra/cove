import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import React, { useCallback, useEffect, useRef, useState } from "react";

import IconByName from "../icon/IconByName";

const COPIED_FEEDBACK_DURATION_MILLISECONDS = 1500;

/**
 * Clipboard write with a fallback for the non-secure contexts where
 * `navigator.clipboard` is undefined (plain-HTTP dev servers, some embeds).
 */
async function writeToClipboard(value: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return true;
        }
    } catch {
        // fall through to the legacy path
    }

    try {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);
        return copied;
    } catch {
        return false;
    }
}

export interface CopyIdProps {
    /** The full identifier. Copied verbatim; only the display is shortened. */
    value: string;
    /**
     * What the reader sees when not truncating, e.g. "id". Keeping identifiers
     * behind a word is the point of the component — a raw UUID in the layout is
     * noise to everyone except the one person debugging.
     */
    label?: string;
    /** When set, shows the first N characters instead of `label`. */
    visibleCharacters?: number;
    size?: "small" | "medium";
    id?: string;
    className?: string;
}

/**
 * An identifier folded away behind a copy affordance: shows a short label,
 * reveals the full value on hover, copies it on click.
 */
export default function CopyId({
    value,
    label = "id",
    visibleCharacters,
    size = "small",
    id,
    className,
}: CopyIdProps) {
    const [isCopied, setIsCopied] = useState(false);
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => () => clearTimeout(resetTimeoutRef.current), []);

    const handleCopy = useCallback(async () => {
        const copied = await writeToClipboard(value);
        if (!copied) return;

        setIsCopied(true);
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = setTimeout(
            () => setIsCopied(false),
            COPIED_FEEDBACK_DURATION_MILLISECONDS,
        );
    }, [value]);

    const displayText =
        visibleCharacters && value.length > visibleCharacters
            ? `${value.slice(0, visibleCharacters)}…`
            : (visibleCharacters && value) || label;

    return (
        <Tooltip title={isCopied ? "Copied" : value} placement="top">
            <Box
                component="button"
                type="button"
                id={id}
                className={className}
                onClick={handleCopy}
                aria-label={`Copy ${label}: ${value}`}
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "border.dark",
                    backgroundColor: "transparent",
                    color: "text.secondary",
                    fontFamily: (theme) => theme.fonts?.monospace,
                    fontSize: size === "small" ? "0.6875rem" : "0.75rem",
                    lineHeight: 1.6,
                    padding: size === "small" ? "1px 6px" : "3px 8px",
                    "&:hover": { color: "text.primary", borderColor: "icon.light" },
                    "&:focus-visible": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: 1,
                    },
                }}>
                {displayText}
                <IconByName
                    name={isCopied ? "shapes.check" : "actions.copy"}
                    sx={{ fontSize: "0.875rem" }}
                />
            </Box>
        </Tooltip>
    );
}
