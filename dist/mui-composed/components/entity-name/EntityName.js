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
    var _a;
    return {
        maxWidth: "100%",
        "& .MuiInputBase-input": {
            // @ts-ignore
            borderBottom: `1px dashed ${((_a = theme.palette.border) === null || _a === void 0 ? void 0 : _a.dark) || "#ccc"}`,
        },
    };
});
function Subtitle({ subtitle }) {
    return (React.createElement(Box, { className: "entity-name-subtitle" }, isObject(subtitle) ? (Object.entries(subtitle).map(([key, value]) => {
        return (React.createElement(React.Fragment, { key: key },
            React.createElement(Typography, { variant: "caption", color: "text.primary", sx: { pr: 0.5, fontWeight: "bold" } }, key),
            React.createElement(Typography, { variant: "caption", color: "text.primary", sx: { pr: 1 } }, value)));
    })) : (React.createElement(Typography, { variant: "caption", color: "text.primary" }, subtitle))));
}
export default function EntityName({ value, subtitle, onClick, icon, showIcon = true, status = "default", subscriptIcon, editable, onUpdate, description, children, image, descriptionLabel = "description", }) {
    const [name, setName] = useState(value);
    useEffect(() => {
        setName(value);
    }, [value]);
    const delayedUpdate = useCallback(debounce((name) => onUpdate && onUpdate(name), 700), []);
    return (React.createElement(Stack, { alignItems: "center", spacing: 2, onClick: onClick, className: "entity-name", direction: "row" },
        showIcon ? (React.createElement(Badge, { overlap: "circular", anchorOrigin: { vertical: "bottom", horizontal: "right" }, badgeContent: subscriptIcon ? (React.createElement(Paper, { sx: { borderRadius: "50%" } },
                React.createElement(Stack, { alignItems: "center" },
                    React.createElement(IconByName, { name: subscriptIcon, fontSize: "small" })))) : null },
            image ? React.createElement(Avatar, { alt: "", src: image, sx: { width: 48, height: 48 } }) : null,
            icon ? (React.createElement(IconByName, { name: icon, fontSize: "large", color: status })) : null)) : null,
        React.createElement(Stack, { className: "entity-name-title", flexGrow: 1 },
            editable ? (React.createElement(StyledInput
            // Without fullWidth, InputBase sizes to the input's default ~20-char
            // intrinsic width and truncates typical entity names; let it fill the
            // name area the header allocates instead.
            , { 
                // Without fullWidth, InputBase sizes to the input's default ~20-char
                // intrinsic width and truncates typical entity names; let it fill the
                // name area the header allocates instead.
                fullWidth: true, componentsProps: {
                    input: {
                        className: "name",
                    },
                }, value: name, onChange: (event) => {
                    const newName = event.target.value;
                    setName(newName);
                    delayedUpdate(newName);
                }, onBlur: (event) => {
                    // Immediate update is required to prevent situation when name is not updated
                    // because of quick 'Save' button click (onChange event has 700ms delay).
                    const newName = event.target.value;
                    if (onUpdate) {
                        onUpdate(newName);
                    }
                } })) : (React.createElement(Typography, { className: "name-text", variant: "body1" }, name)),
            React.createElement(Subtitle, { subtitle: subtitle }),
            description ? (React.createElement(Stack, { direction: "row" },
                React.createElement(Typography, { variant: "caption", color: "text.primary", sx: { fontWeight: "bold", mr: 0.5 } },
                    descriptionLabel,
                    ":"),
                React.createElement(Typography, { variant: "caption", color: "text.primary", className: "description" }, description))) : null),
        React.createElement(Stack, null, children)));
}
