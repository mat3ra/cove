/**
 * ButtonMultiSelect Component
 *
 * Overview:
 * The ButtonMultiSelect component is a reusable, configurable button group component.
 * It allows the creation of a configurable buttons which allows for selecting from multiple possible actions.
 * The state of the selected button is saved in localStorage.
 *
 * Usage:
 * To use this component, define an array of ButtonConfig objects, each representing a button's configuration.
 * Pass this array along with a localStorage key (for saving the selected button's state) to the component.
 *
 * Example:
 * ```
 * <ButtonMultiSelect
 *    buttonConfigs={[
 *        { id: 'save', iconName: 'save_icon', label: 'Save', onClick: handleSave },
 *        { id: 'cancel', iconName: 'cancel_icon', label: 'Cancel', onClick: handleCancel }
 *    ]}
 *    localStorageKey="myButtonSelectKey"
 *    size="medium"
 *    isLoading={false}
 *    isCompact={true}
 * />
 * ```
 */
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import React, { useCallback, useEffect, useState } from "react";
import IconByName from "../icon/IconByName";
function ButtonMultiSelect({ id, buttonConfigs, size = "small", localStorageKey, isLoading = false, isCompact = false, }) {
    var _a;
    const [anchorEl, setAnchorEl] = useState(null);
    // Track the *id* of the selection, not the config object. Storing the object
    // snapshotted whichever `buttonConfigs[0]` happened to be passed on mount and
    // never resynced, so the component kept calling the first `onClick` closure it
    // ever received: a parent that re-rendered with fresh handlers (or a changed
    // label) was ignored for the lifetime of the component, and consumers had to
    // work around it by reading their own state at click time.
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const mainButtonRef = React.useRef(null);
    const open = Boolean(anchorEl);
    // Resolved against the live prop on every render, so handlers are never stale.
    const selectedOption = (_a = buttonConfigs.find((config) => config.id === selectedOptionId)) !== null && _a !== void 0 ? _a : buttonConfigs[0];
    // load saved option from local storage
    useEffect(() => {
        const savedOptionId = localStorage.getItem(localStorageKey);
        // check if value matches one of the button configs
        if (savedOptionId && buttonConfigs.some((config) => config.id === savedOptionId)) {
            setSelectedOptionId(savedOptionId);
        }
    }, [localStorageKey, buttonConfigs]);
    const handleExpandClick = useCallback(() => {
        setAnchorEl(mainButtonRef.current);
    }, []);
    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);
    const handleMenuClick = useCallback((config) => {
        // Write under the same key the effect above reads. This used to persist
        // to a hard-coded "selectedSaveOption", so every instance whose
        // localStorageKey was anything else silently forgot the choice on reload.
        localStorage.setItem(localStorageKey, config.id);
        setSelectedOptionId(config.id);
        handleClose();
    }, [localStorageKey, handleClose]);
    // Nothing to offer: render nothing rather than dereferencing an empty list.
    if (!selectedOption)
        return null;
    return (React.createElement(React.Fragment, null,
        React.createElement(ButtonGroup, { variant: "contained", size: size, sx: { height: "fit-content" } },
            React.createElement(LoadingButton, { id: id, ref: mainButtonRef, size: size, onClick: selectedOption.onClick, variant: "contained", loading: isLoading, startIcon: !isCompact && React.createElement(IconByName, { name: selectedOption.iconName, fontSize: size }) }, isCompact ? (React.createElement(IconByName, { name: selectedOption.iconName, fontSize: size })) : (selectedOption.label)),
            React.createElement(Button, { onClick: handleExpandClick, size: size },
                React.createElement(IconByName, { name: "shapes.arrow.dropdown", fontSize: size }))),
        React.createElement(Menu, { anchorEl: anchorEl, keepMounted: true, open: open, onClose: handleClose }, buttonConfigs.map((config) => (React.createElement(MenuItem, { key: config.id, onClick: () => handleMenuClick(config) }, config.label))))));
}
export default ButtonMultiSelect;
