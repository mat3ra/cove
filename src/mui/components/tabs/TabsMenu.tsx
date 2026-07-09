import FormControl from "@mui/material/FormControl";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha, styled, useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import type { TabsProps } from "@mui/material/Tabs";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React, { useEffect } from "react";

import IconByName from "../icon/IconByName";
import type { TabItem } from "./types";

const TabsMenuContainer = styled("div")(({ theme }: { theme?: Theme }) => ({
    backgroundColor: theme?.palette.background.paper,
    borderBottom: `1px solid ${theme?.palette.divider}`,
    ".MuiTab-root": {
        color: theme?.palette.text.primary,
    },
}));

interface TabsMenuProps {
    tabs: TabItem[];
    activeTabIndex: number;
    centered?: TabsProps["centered"];
    variant?: TabsProps["variant"];
    sx?: SxProps;
    sxContainer?: SxProps;
}

type TabState = TabItem & {
    isEditing?: boolean;
};

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

type MenuTabTextFieldProps = {
    tab: TabItem;
    onChangeHandler: (event: ChangeEvent, tab: TabItem) => void;
    onSubmitHandler: (event: ChangeEvent, tab: TabItem) => void;
    closeOnReturn: (event: React.KeyboardEvent, tab: TabItem) => void;
};

function MenuTabTextField({
    tab,
    onChangeHandler,
    onSubmitHandler,
    closeOnReturn,
}: MenuTabTextFieldProps) {
    const width = 150;
    return (
        <FormControl sx={{ flexDirection: "row", alignItems: "center", width }}>
            <TextField
                type="text"
                color="primary"
                variant="outlined"
                defaultValue={tab.itemName}
                value={tab.itemName}
                autoFocus
                InputProps={{ disableUnderline: true }}
                sx={{ flexDirection: "row", alignItems: "center", width }}
                onChange={(e) => onChangeHandler(e, tab)}
                onSubmit={(e) => onSubmitHandler(e as unknown as ChangeEvent, tab)}
                onBlur={(e) => onSubmitHandler(e, tab)}
                onKeyDown={(e) => closeOnReturn(e, tab)}
            />
        </FormControl>
    );
}

export default function TabsMenu({
    tabs,
    activeTabIndex,
    centered,
    variant,
    sx,
    sxContainer,
}: TabsMenuProps) {
    const [tabsState, setTabsState] = React.useState<TabState[]>(
        tabs.map((tab) => ({ ...tab, isEditing: false })),
    );

    const onSubmitHandler = (event: ChangeEvent, tab: TabItem) => {
        if (!tab.onLabelChange || !event.target.value) return;
        setTabsState((prev) =>
            prev.map((t) => (t.itemName === tab.itemName ? { ...t, isEditing: false } : t)),
        );
        tab.onLabelChange(event.target.value);
    };

    const onChangeHandler = (event: ChangeEvent, tab: TabItem) => {
        if (!event.target.value) return;
        setTabsState((prev) =>
            prev.map((t) =>
                t.itemName === tab.itemName ? { ...t, itemName: event.target.value } : t,
            ),
        );
    };

    const onOpenEditor = (tab: TabItem) => {
        if (!tab.labelIsEditable) return;
        setTabsState((prev) =>
            prev.map((t) => (t.itemName === tab.itemName ? { ...t, isEditing: true } : t)),
        );
    };

    const closeOnReturn = (event: React.KeyboardEvent, tab: TabItem) => {
        if (event.keyCode === 13) {
            onSubmitHandler(event as any, tab);
        }
    };

    useEffect(() => {
        setTabsState(tabs.map((tab) => ({ ...tab, isEditing: false })));
    }, [tabs]);

    const theme = useTheme();

    const failSafeActiveTabIndex = activeTabIndex >= 0 ? activeTabIndex : 0;

    const handleTabClick = (tab: TabItem, event: React.MouseEvent<HTMLElement>) => {
        if (!tab.onClick) return;
        event.preventDefault();
        tab.onClick(event);
    };

    return (
        <TabsMenuContainer className="tab-menu" sx={sxContainer}>
            <Tabs
                className="TabsMenuContainer-Tabs"
                value={failSafeActiveTabIndex}
                variant={variant}
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{ alignItems: "center" }}
                centered={centered}>
                {tabsState.map((tab, index) => {
                    if (tab.isEditing) {
                        return (
                            <MenuTabTextField
                                key={tab.itemName}
                                tab={tab}
                                onChangeHandler={onChangeHandler}
                                onSubmitHandler={onSubmitHandler}
                                closeOnReturn={closeOnReturn}
                            />
                        );
                    }
                    if (tab.labelIsEditable) {
                        return (
                            <Tooltip
                                key={tab.itemName}
                                title="Double-click to edit"
                                enterDelay={700}
                                enterNextDelay={700}
                                leaveDelay={100}
                                placement="top">
                                <Tab
                                    component="a"
                                    target={tab.target}
                                    className={tab.className}
                                    data-tab-index={index}
                                    data-tab-name={tab.dataName || tab.itemName}
                                    icon={
                                        tab.iconCls ? <IconByName name={tab.iconCls} /> : undefined
                                    }
                                    iconPosition="start"
                                    label={tab.itemName}
                                    href={tab.href}
                                    onClick={(event) => handleTabClick(tab, event)}
                                    onDoubleClick={() => onOpenEditor(tab)}
                                    sx={{
                                        minHeight: 52,
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.05,
                                            ),
                                        },
                                        ...sx,
                                    }}
                                />
                            </Tooltip>
                        );
                    }
                    return (
                        <Tab
                            component="a"
                            key={tab.itemName}
                            target={tab.target}
                            className={tab.className}
                            data-tab-index={index}
                            data-tab-name={tab.dataName || tab.itemName}
                            icon={tab.iconCls ? <IconByName name={tab.iconCls} /> : undefined}
                            iconPosition="start"
                            label={tab.itemName}
                            href={tab.href}
                            onClick={(event) => handleTabClick(tab, event)}
                            onDoubleClick={() => onOpenEditor(tab)}
                            sx={{ minHeight: 52, ...sx }}
                        />
                    );
                })}
            </Tabs>
        </TabsMenuContainer>
    );
}
