import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
export function AccountCard({ account, onClick, subtitle, size = "medium" }) {
    const name = (account === null || account === void 0 ? void 0 : account.name) || "?";
    const avatarUrl = account === null || account === void 0 ? void 0 : account.avatarUrl;
    const sizes = {
        medium: { name: "body2", type: "caption", avatar: 32 },
        large: { name: "body1", type: "subtitle2", avatar: 48 },
    };
    const currentSize = sizes[size] || sizes.medium;
    return (React.createElement(Stack, { direction: "row", spacing: 1.5, alignItems: "center", sx: { cursor: onClick ? "pointer" : "default" }, onClick: onClick },
        React.createElement(Avatar, { src: avatarUrl, alt: name, sx: {
                width: currentSize.avatar,
                height: currentSize.avatar,
                fontSize: currentSize.avatar / 2.5,
            } }, !avatarUrl ? name.substring(0, 1).toUpperCase() : undefined),
        React.createElement(Stack, { spacing: 0.2, overflow: "hidden" },
            React.createElement(Typography, { variant: currentSize.name, noWrap: true, fontWeight: "bold" }, name),
            subtitle && (React.createElement(Typography, { variant: currentSize.type, color: "text.secondary", noWrap: true }, subtitle)))));
}
export default AccountCard;
