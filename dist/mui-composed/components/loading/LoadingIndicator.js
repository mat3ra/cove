import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";
export function LoadingIndicator({ included = false, size = "medium", maxHeight, }) {
    const sizeMap = {
        small: 24,
        medium: 40,
        large: 64,
    };
    const progressSize = typeof size === "number" ? size : sizeMap[size] || 40;
    return (React.createElement(Box, { display: "flex", alignItems: "center", justifyContent: "center", sx: {
            width: "100%",
            height: included ? "100%" : "100vh",
            minHeight: included ? 100 : "100vh",
            maxHeight: maxHeight || "100%",
        } },
        React.createElement(CircularProgress, { size: progressSize })));
}
export default LoadingIndicator;
