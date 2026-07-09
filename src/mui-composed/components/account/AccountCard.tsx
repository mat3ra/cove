import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { SyntheticEvent } from "react";

export interface AccountCardProps {
    account: {
        name?: string;
        avatarUrl?: string;
    };
    onClick?: (event: SyntheticEvent) => void;
    subtitle?: string;
    size?: "medium" | "large";
}

export function AccountCard({ account, onClick, subtitle, size = "medium" }: AccountCardProps) {
    const name = account?.name || "?";
    const avatarUrl = account?.avatarUrl;

    const sizes = {
        medium: { name: "body2" as const, type: "caption" as const, avatar: 32 },
        large: { name: "body1" as const, type: "subtitle2" as const, avatar: 48 },
    };

    const currentSize = sizes[size] || sizes.medium;

    return (
        <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ cursor: onClick ? "pointer" : "default" }}
            onClick={onClick}>
            <Avatar
                src={avatarUrl}
                alt={name}
                sx={{
                    width: currentSize.avatar,
                    height: currentSize.avatar,
                    fontSize: currentSize.avatar / 2.5,
                }}>
                {!avatarUrl ? name.substring(0, 1).toUpperCase() : undefined}
            </Avatar>
            <Stack spacing={0.2} overflow="hidden">
                <Typography variant={currentSize.name} noWrap fontWeight="bold">
                    {name}
                </Typography>
                {subtitle && (
                    <Typography variant={currentSize.type} color="text.secondary" noWrap>
                        {subtitle}
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
}

export default AccountCard;
