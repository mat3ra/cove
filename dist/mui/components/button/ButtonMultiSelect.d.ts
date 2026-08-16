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
import React from "react";
export type ButtonConfig = {
    id: string;
    iconName: string;
    label: string;
    onClick: () => void;
};
type ButtonMultiSelectProps = {
    id?: string;
    buttonConfigs: ButtonConfig[];
    size?: "small" | "medium" | "large";
    localStorageKey: string;
    isLoading?: boolean;
    isCompact?: boolean;
};
declare function ButtonMultiSelect({ id, buttonConfigs, size, localStorageKey, isLoading, isCompact, }: ButtonMultiSelectProps): React.JSX.Element | null;
export default ButtonMultiSelect;
