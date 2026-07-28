import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import React from "react";
import EntityName from "../entity-name/EntityName";
export function EntityHeader({ name, subtitle, icon, iconCls, isLoading, children, id, editable, onNameUpdate, description, descriptionLabel, image, subscriptIcon, }) {
    return (React.createElement(React.Fragment, null,
        React.createElement(Paper, { id: id, className: "entity-header", elevation: 0, sx: { width: "100%", bgcolor: "background.paper" } },
            React.createElement(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", p: 2 },
                React.createElement(Stack, { flexGrow: 1, sx: { flexBasis: "50%", minWidth: 0 } },
                    React.createElement(EntityName, { value: name, subtitle: subtitle, icon: icon, status: iconCls, editable: editable && !isLoading, onUpdate: onNameUpdate, description: description, descriptionLabel: descriptionLabel, image: image, subscriptIcon: subscriptIcon })),
                React.createElement(Stack, { direction: "row", spacing: 1, alignItems: "center" }, children))),
        React.createElement(Divider, null)));
}
export default EntityHeader;
