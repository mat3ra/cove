import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";

export interface LoadingIndicatorProps {
    included?: boolean;
    size?: "small" | "medium" | "large" | number | string;
    maxHeight?: number | string;
}

export function LoadingIndicator({
    included = false,
    size = "medium",
    maxHeight,
}: LoadingIndicatorProps) {
    const sizeMap: Record<string, number> = {
        small: 24,
        medium: 40,
        large: 64,
    };
    const progressSize = typeof size === "number" ? size : sizeMap[size] || 40;

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
                width: "100%",
                height: included ? "100%" : "100vh",
                minHeight: included ? 100 : "100vh",
                maxHeight: maxHeight || "100%",
            }}>
            <CircularProgress size={progressSize} />
        </Box>
    );
}

export default LoadingIndicator;
