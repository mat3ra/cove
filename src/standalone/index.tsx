import React from "react";
import ReactDOM from "react-dom";

import GalleryApp from "./GalleryApp";

const container = document.getElementById("root");
if (!container) {
    throw new Error("Root element not found");
}
// react-dom 17 — no createRoot here.
ReactDOM.render(<GalleryApp />, container);
