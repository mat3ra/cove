import React from "react";
export interface LoadingIndicatorProps {
    included?: boolean;
    size?: "small" | "medium" | "large" | number | string;
    maxHeight?: number | string;
}
export declare function LoadingIndicator({ included, size, maxHeight, }: LoadingIndicatorProps): React.JSX.Element;
export default LoadingIndicator;
