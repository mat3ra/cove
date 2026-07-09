import React from "react";
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
export default function EntityName({ value, subtitle, onClick, icon, showIcon, status, subscriptIcon, editable, onUpdate, description, children, image, descriptionLabel, }: NameProps): React.JSX.Element;
export {};
