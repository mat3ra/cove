import FormControl from "@mui/material/FormControl";
import { alpha, styled, useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React, { useEffect } from "react";
import IconByName from "../icon/IconByName";
const TabsMenuContainer = styled("div")(({ theme }) => ({
    backgroundColor: theme === null || theme === void 0 ? void 0 : theme.palette.background.paper,
    borderBottom: `1px solid ${theme === null || theme === void 0 ? void 0 : theme.palette.divider}`,
    ".MuiTab-root": {
        color: theme === null || theme === void 0 ? void 0 : theme.palette.text.primary,
    },
}));
function MenuTabTextField({ tab, onChangeHandler, onSubmitHandler, closeOnReturn, }) {
    const width = 150;
    return (React.createElement(FormControl, { sx: { flexDirection: "row", alignItems: "center", width } },
        React.createElement(TextField, { type: "text", color: "primary", variant: "outlined", defaultValue: tab.itemName, value: tab.itemName, autoFocus: true, InputProps: { disableUnderline: true }, sx: { flexDirection: "row", alignItems: "center", width }, onChange: (e) => onChangeHandler(e, tab), onSubmit: (e) => onSubmitHandler(e, tab), onBlur: (e) => onSubmitHandler(e, tab), onKeyDown: (e) => closeOnReturn(e, tab) })));
}
export default function TabsMenu({ tabs, activeTabIndex, centered, variant, sx, sxContainer, }) {
    const [tabsState, setTabsState] = React.useState(tabs.map((tab) => ({ ...tab, isEditing: false })));
    const onSubmitHandler = (event, tab) => {
        if (!tab.onLabelChange || !event.target.value)
            return;
        setTabsState((prev) => prev.map((t) => (t.itemName === tab.itemName ? { ...t, isEditing: false } : t)));
        tab.onLabelChange(event.target.value);
    };
    const onChangeHandler = (event, tab) => {
        if (!event.target.value)
            return;
        setTabsState((prev) => prev.map((t) => t.itemName === tab.itemName ? { ...t, itemName: event.target.value } : t));
    };
    const onOpenEditor = (tab) => {
        if (!tab.labelIsEditable)
            return;
        setTabsState((prev) => prev.map((t) => (t.itemName === tab.itemName ? { ...t, isEditing: true } : t)));
    };
    const closeOnReturn = (event, tab) => {
        if (event.keyCode === 13) {
            onSubmitHandler(event, tab);
        }
    };
    useEffect(() => {
        setTabsState(tabs.map((tab) => ({ ...tab, isEditing: false })));
    }, [tabs]);
    const theme = useTheme();
    const failSafeActiveTabIndex = activeTabIndex >= 0 ? activeTabIndex : 0;
    const handleTabClick = (tab, event) => {
        if (!tab.onClick)
            return;
        event.preventDefault();
        tab.onClick(event);
    };
    return (React.createElement(TabsMenuContainer, { className: "tab-menu", sx: sxContainer },
        React.createElement(Tabs, { className: "TabsMenuContainer-Tabs", value: failSafeActiveTabIndex, variant: variant, scrollButtons: "auto", allowScrollButtonsMobile: true, sx: { alignItems: "center" }, centered: centered }, tabsState.map((tab, index) => {
            if (tab.isEditing) {
                return (React.createElement(MenuTabTextField, { key: tab.itemName, tab: tab, onChangeHandler: onChangeHandler, onSubmitHandler: onSubmitHandler, closeOnReturn: closeOnReturn }));
            }
            if (tab.labelIsEditable) {
                return (React.createElement(Tooltip, { key: tab.itemName, title: "Double-click to edit", enterDelay: 700, enterNextDelay: 700, leaveDelay: 100, placement: "top" },
                    React.createElement(Tab, { component: "a", target: tab.target, className: tab.className, "data-tab-index": index, "data-tab-name": tab.dataName || tab.itemName, icon: tab.iconCls ? React.createElement(IconByName, { name: tab.iconCls }) : undefined, iconPosition: "start", label: tab.itemName, href: tab.href, onClick: (event) => handleTabClick(tab, event), onDoubleClick: () => onOpenEditor(tab), sx: {
                            minHeight: 52,
                            "&:hover": {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                            ...sx,
                        } })));
            }
            return (React.createElement(Tab, { component: "a", key: tab.itemName, target: tab.target, className: tab.className, "data-tab-index": index, "data-tab-name": tab.dataName || tab.itemName, icon: tab.iconCls ? React.createElement(IconByName, { name: tab.iconCls }) : undefined, iconPosition: "start", label: tab.itemName, href: tab.href, onClick: (event) => handleTabClick(tab, event), onDoubleClick: () => onOpenEditor(tab), sx: { minHeight: 52, ...sx } }));
        }))));
}
