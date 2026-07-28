import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import styled from "@mui/material/styles/styled";
import Typography from "@mui/material/Typography";
import debounce from "lodash/debounce";
import isObject from "lodash/isObject";
import React, { useCallback, useEffect, useState } from "react";

import IconByName from "../../../mui/components/icon/IconByName";

const StyledInput = styled(InputBase)(({ theme }) => {
    return {
        maxWidth: "100%",
        "& .MuiInputBase-input": {
            // @ts-ignore
            borderBottom: `1px dashed ${theme.palette.border?.dark || "#ccc"}`,
        },
    };
});

interface NameProps {
    onClick?: () => void;
    icon?: string;
    showIcon?: boolean;
    status?: string;
    subtitle?: string | Record<string, string>;
    subscriptIcon?: string;
    value: string;
    editable?: boolean;
    onUpdate?: (name: string) => void;
    description?: string;
    children?: React.ReactElement;
    image?: string;
    descriptionLabel?: string;
}

function Subtitle({ subtitle }: { subtitle?: string | Record<string, string> }) {
    return (
        <Box className="entity-name-subtitle">
            {isObject(subtitle) ? (
                Object.entries(subtitle).map(([key, value]) => {
                    return (
                        <React.Fragment key={key}>
                            <Typography
                                variant="caption"
                                color="text.primary"
                                sx={{ pr: 0.5, fontWeight: "bold" }}>
                                {key}
                            </Typography>
                            <Typography variant="caption" color="text.primary" sx={{ pr: 1 }}>
                                {value}
                            </Typography>
                        </React.Fragment>
                    );
                })
            ) : (
                <Typography variant="caption" color="text.primary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
}

export default function EntityName({
    value,
    subtitle,
    onClick,
    icon,
    showIcon = true,
    status = "default",
    subscriptIcon,
    editable,
    onUpdate,
    description,
    children,
    image,
    descriptionLabel = "description",
}: NameProps) {
    const [name, setName] = useState(value);

    useEffect(() => {
        setName(value);
    }, [value]);

    const delayedUpdate = useCallback(
        debounce((name) => onUpdate && onUpdate(name), 700),
        [],
    );

    return (
        <Stack
            alignItems="center"
            spacing={2}
            onClick={onClick}
            className="entity-name"
            direction="row">
            {/* Icon/Avatar */}
            {showIcon ? (
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                        subscriptIcon ? (
                            <Paper sx={{ borderRadius: "50%" }}>
                                <Stack alignItems="center">
                                    <IconByName name={subscriptIcon} fontSize="small" />
                                </Stack>
                            </Paper>
                        ) : null
                    }>
                    {image ? <Avatar alt="" src={image} sx={{ width: 48, height: 48 }} /> : null}
                    {icon ? (
                        <IconByName name={icon} fontSize="large" color={status as any} />
                    ) : null}
                </Badge>
            ) : null}
            {/* Entity name */}
            <Stack className="entity-name-title" flexGrow={1}>
                {editable ? (
                    <StyledInput
                        // Without fullWidth, InputBase sizes to the input's default ~20-char
                        // intrinsic width and truncates typical entity names; let it fill the
                        // name area the header allocates instead.
                        fullWidth
                        componentsProps={{
                            input: {
                                className: "name",
                            },
                        }}
                        value={name}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const newName = event.target.value;
                            setName(newName);
                            delayedUpdate(newName);
                        }}
                        onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                            // Immediate update is required to prevent situation when name is not updated
                            // because of quick 'Save' button click (onChange event has 700ms delay).
                            const newName = event.target.value;
                            if (onUpdate) {
                                onUpdate(newName);
                            }
                        }}
                    />
                ) : (
                    <Typography className="name-text" variant="body1">
                        {name}
                    </Typography>
                )}
                <Subtitle subtitle={subtitle} />
                {description ? (
                    <Stack direction="row">
                        <Typography
                            variant="caption"
                            color="text.primary"
                            sx={{ fontWeight: "bold", mr: 0.5 }}>
                            {descriptionLabel}:
                        </Typography>
                        <Typography variant="caption" color="text.primary" className="description">
                            {description}
                        </Typography>
                    </Stack>
                ) : null}
            </Stack>
            {/* Children */}
            <Stack>{children}</Stack>
        </Stack>
    );
}
