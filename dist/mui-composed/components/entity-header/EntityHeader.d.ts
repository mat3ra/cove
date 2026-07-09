import React from "react";
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
export declare function EntityHeader({ name, subtitle, icon, iconCls, isLoading, children, id, editable, onNameUpdate, description, descriptionLabel, image, subscriptIcon, }: EntityHeaderProps): React.JSX.Element;
export default EntityHeader;
