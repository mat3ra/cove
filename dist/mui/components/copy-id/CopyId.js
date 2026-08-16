import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import React, { useCallback, useEffect, useRef, useState } from "react";
import IconByName from "../icon/IconByName";
const COPIED_FEEDBACK_DURATION_MILLISECONDS = 1500;
/**
 * Clipboard write with a fallback for the non-secure contexts where
 * `navigator.clipboard` is undefined (plain-HTTP dev servers, some embeds).
 */
async function writeToClipboard(value) {
    var _a;
    try {
        if ((_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText) {
            await navigator.clipboard.writeText(value);
            return true;
        }
    }
    catch (_b) {
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
    }
    catch (_c) {
        return false;
    }
}
/**
 * An identifier folded away behind a copy affordance: shows a short label,
 * reveals the full value on hover, copies it on click.
 */
export default function CopyId({ value, label = "id", visibleCharacters, size = "small", id, className, }) {
    const [isCopied, setIsCopied] = useState(false);
    const resetTimeoutRef = useRef();
    useEffect(() => () => clearTimeout(resetTimeoutRef.current), []);
    const handleCopy = useCallback(async () => {
        const copied = await writeToClipboard(value);
        if (!copied)
            return;
        setIsCopied(true);
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_DURATION_MILLISECONDS);
    }, [value]);
    const displayText = visibleCharacters && value.length > visibleCharacters
        ? `${value.slice(0, visibleCharacters)}…`
        : (visibleCharacters && value) || label;
    return (React.createElement(Tooltip, { title: isCopied ? "Copied" : value, placement: "top" },
        React.createElement(Box, { component: "button", type: "button", id: id, className: className, onClick: handleCopy, "aria-label": `Copy ${label}: ${value}`, sx: {
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "border.dark",
                backgroundColor: "transparent",
                color: "text.secondary",
                fontFamily: (theme) => { var _a; return (_a = theme.fonts) === null || _a === void 0 ? void 0 : _a.monospace; },
                fontSize: size === "small" ? "0.6875rem" : "0.75rem",
                lineHeight: 1.6,
                padding: size === "small" ? "1px 6px" : "3px 8px",
                "&:hover": { color: "text.primary", borderColor: "icon.light" },
                "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: 1,
                },
            } },
            displayText,
            React.createElement(IconByName, { name: isCopied ? "shapes.check" : "actions.copy", sx: { fontSize: "0.875rem" } }))));
}
