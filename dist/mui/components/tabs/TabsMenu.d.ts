import type { SxProps } from "@mui/material/styles";
import type { TabsProps } from "@mui/material/Tabs";
import React from "react";
import type { TabItem } from "./types";
interface TabsMenuProps {
    tabs: TabItem[];
    activeTabIndex: number;
    centered?: TabsProps["centered"];
    variant?: TabsProps["variant"];
    sx?: SxProps;
    sxContainer?: SxProps;
}
export default function TabsMenu({ tabs, activeTabIndex, centered, variant, sx, sxContainer, }: TabsMenuProps): React.JSX.Element;
export {};
