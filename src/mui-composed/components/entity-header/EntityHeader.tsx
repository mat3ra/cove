import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import React from "react";

import EntityName from "../entity-name/EntityName";

export interface EntityHeaderProps {
    name: string;
    subtitle?: string | Record<string, string>;
    icon?: string;
    iconCls?: string;
    isLoading?: boolean;
    children?: React.ReactNode;
    id?: string;
    editable?: boolean;
    onNameUpdate?: (name: string) => void;
    description?: string;
    descriptionLabel?: string;
    image?: string;
    subscriptIcon?: string;
}

export function EntityHeader({
    name,
    subtitle,
    icon,
    iconCls,
    isLoading,
    children,
    id,
    editable,
    onNameUpdate,
    description,
    descriptionLabel,
    image,
    subscriptIcon,
}: EntityHeaderProps) {
    return (
        <>
            <Paper
                id={id}
                className="entity-header"
                elevation={0}
                sx={{ width: "100%", bgcolor: "background.paper" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" p={2}>
                    {/* flexBasis 50%: the (editable) name gets at least half the header and can
                        grow into unused space; minWidth 0 lets long names truncate instead of
                        pushing the actions out of the header. Deliberately a column Stack: its
                        default cross-axis stretch is what makes EntityName (and its fullWidth
                        input) span the whole area - a row Stack sizes children to content,
                        which shrank the editable name to the input's ~20-char intrinsic width. */}
                    <Stack flexGrow={1} sx={{ flexBasis: "50%", minWidth: 0 }}>
                        <EntityName
                            value={name}
                            subtitle={subtitle}
                            icon={icon}
                            status={iconCls}
                            editable={editable && !isLoading}
                            onUpdate={onNameUpdate}
                            description={description}
                            descriptionLabel={descriptionLabel}
                            image={image}
                            subscriptIcon={subscriptIcon}
                        />
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {children}
                    </Stack>
                </Stack>
            </Paper>
            <Divider />
        </>
    );
}

export default EntityHeader;
