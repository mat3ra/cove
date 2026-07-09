import React from "react";

export interface TabItem {
    id?: string;
    itemName: string;
    className: string;
    href?: string;
    iconCls?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    target?: string;
    dataName?: string | number;
    labelIsEditable?: boolean;
    onLabelChange?: (newLabel: string) => void;
}
