import React from "react";
import InfoPopover from "./InfoPopover";
/**
 * InfoPopover wrapper that supports an optional documentation deep-link.
 * Unlike the webapp-specific InfoPopoverWithDocumentationDialog, this component
 * has no Redux or Meteor dependencies — the caller wires the onLearnMore callback.
 */
export function InfoPopoverWithDocumentation({ popoverTitle, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
searchText, onLearnMore, children, }) {
    return (React.createElement(InfoPopover, { title: popoverTitle, onButtonClick: onLearnMore, iconSize: "small" }, children));
}
export default InfoPopoverWithDocumentation;
