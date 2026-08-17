import React from "react";
export interface CopyIdProps {
    /** The full identifier. Copied verbatim; only the display is shortened. */
    value: string;
    /**
     * What the reader sees when not truncating, e.g. "id". Keeping identifiers
     * behind a word is the point of the component — a raw UUID in the layout is
     * noise to everyone except the one person debugging.
     */
    label?: string;
    /** When set, shows the first N characters instead of `label`. */
    visibleCharacters?: number;
    size?: "small" | "medium";
    id?: string;
    className?: string;
}
/**
 * An identifier folded away behind a copy affordance: shows a short label,
 * reveals the full value on hover, copies it on click.
 */
export default function CopyId({ value, label, visibleCharacters, size, id, className, }: CopyIdProps): React.JSX.Element;
