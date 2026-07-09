import React from "react";

import InfoPopover from "./InfoPopover";

export interface InfoPopoverWithDocumentationProps {
    popoverTitle: string;
    /**
     * Text used to identify the documentation topic.
     * Provided for documentation purposes; consumers may use it to open
     * a documentation dialog (e.g. via onLearnMore).
     */
    searchText: string;
    /** Optional callback invoked when the user clicks "Learn more". */
    onLearnMore?: () => void;
    children: React.ReactNode;
}

/**
 * InfoPopover wrapper that supports an optional documentation deep-link.
 * Unlike the webapp-specific InfoPopoverWithDocumentationDialog, this component
 * has no Redux or Meteor dependencies — the caller wires the onLearnMore callback.
 */
export function InfoPopoverWithDocumentation({
    popoverTitle,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    searchText,
    onLearnMore,
    children,
}: InfoPopoverWithDocumentationProps) {
    return (
        <InfoPopover title={popoverTitle} onButtonClick={onLearnMore} iconSize="small">
            {children}
        </InfoPopover>
    );
}

export default InfoPopoverWithDocumentation;
