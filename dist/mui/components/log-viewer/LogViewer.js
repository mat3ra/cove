import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
/**
 * A tail of log output, pinned to the end unless the reader scrolls away.
 *
 * The pinning is the whole point. A log that always jumps to the bottom cannot
 * be read while it is being written, and one that never does makes the reader
 * chase it. This follows until the reader scrolls up — then it stops and offers
 * to resume, so looking at something is never interrupted by an arriving line.
 */
export default function LogViewer({ text, emptyMessage = "No output yet.", rows = 16, label = "Log", isLive = false, id, className, }) {
    const scrollRef = React.useRef(null);
    const [isFollowing, setIsFollowing] = React.useState(true);
    const scrollToEnd = React.useCallback(() => {
        const node = scrollRef.current;
        if (node)
            node.scrollTop = node.scrollHeight;
    }, []);
    React.useEffect(() => {
        if (isFollowing)
            scrollToEnd();
    }, [text, isFollowing, scrollToEnd]);
    const handleScroll = () => {
        const node = scrollRef.current;
        if (!node)
            return;
        // A few pixels of slack: browsers round fractional scroll heights, and an
        // exact comparison would drop out of follow mode on its own.
        const distanceFromEnd = node.scrollHeight - node.scrollTop - node.clientHeight;
        setIsFollowing(distanceFromEnd < 8);
    };
    return (React.createElement(Box, { id: id, className: className },
        React.createElement(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 0.5 } },
            React.createElement(Typography, { variant: "caption", color: "text.secondary" }, label),
            isFollowing ? null : (React.createElement(Button, { size: "small", onClick: () => {
                    setIsFollowing(true);
                    scrollToEnd();
                } }, "Follow"))),
        React.createElement(Box, { component: "pre", ref: scrollRef, onScroll: handleScroll, "aria-label": label, role: "log", "aria-live": isLive ? "polite" : "off", tabIndex: 0, sx: {
                m: 0,
                p: 1.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "action.hover",
                color: text ? "text.primary" : "text.disabled",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.75rem",
                lineHeight: 1.5,
                // Rows rather than a pixel height, so it scales with the font.
                maxHeight: `calc(${rows} * 1.5 * 0.75rem + 24px)`,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
            } }, text || emptyMessage)));
}
