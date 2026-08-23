import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import React from "react";

import IconByName from "../icon/IconByName";
import {
    canDecrement as canDecrementValue,
    canIncrement as canIncrementValue,
    nextSteppedValue,
} from "./bounds";

export interface NumericStepperInputProps {
    label: string;
    value?: number;
    onChange: (value: number | undefined) => void;
    min?: number;
    max?: number;
    step?: number;
    /** Unit shown inside the field, e.g. "cores". */
    unit?: string;
    /** Shown under the field. Turns red when `error` is set. */
    helperText?: React.ReactNode;
    error?: boolean;
    disabled?: boolean;
    size?: "small" | "medium";
    id?: string;
    className?: string;
}

/**
 * A bounded number, with the bounds visible and reachable.
 *
 * A plain number field puts the limits in a validation message the reader meets
 * only after getting it wrong. Here the steppers stop at `min` and `max`, so the
 * common case — nudging cores up until it is enough — cannot produce an invalid
 * value at all, and the helper text can state the range instead of complaining
 * about it afterwards.
 *
 * Typing is still allowed past the bounds: clamping mid-keystroke fights the
 * reader (typing "16" over a max of 8 would become "1"). Out-of-range typed
 * values are reported through `error`, which is where a form's own validation
 * belongs.
 */
export default function NumericStepperInput({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit,
    helperText,
    error = false,
    disabled = false,
    size = "small",
    id,
    className,
}: NumericStepperInputProps) {
    const bounds = { min, max };
    const canDecrement = !disabled && canDecrementValue(value, bounds);
    const canIncrement = !disabled && canIncrementValue(value, bounds);

    const nudge = (direction: 1 | -1) => onChange(nextSteppedValue(value, direction, step, bounds));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value: raw } = event.target;
        if (raw === "") {
            // Empty is "not set", not zero — clearing the field to retype should
            // not momentarily request zero cores.
            onChange(undefined);
            return;
        }

        const parsed = Number(raw);
        if (Number.isFinite(parsed)) onChange(parsed);
    };

    return (
        <TextField
            id={id}
            className={className}
            label={label}
            size={size}
            type="number"
            value={value ?? ""}
            onChange={handleChange}
            error={error}
            helperText={helperText}
            disabled={disabled}
            // Nested rather than a sibling `inputProps`: the two spellings differ
            // only by case, which reads as a duplicated prop.
            InputProps={{
                inputProps: { min, max, step, "aria-label": label },
                startAdornment: (
                    <InputAdornment position="start">
                        <IconButton
                            size="small"
                            edge="start"
                            aria-label={`Decrease ${label}`}
                            disabled={!canDecrement}
                            onClick={() => nudge(-1)}>
                            <IconByName name="shapes.removeCircle" fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        {unit ? (
                            <span style={{ opacity: 0.7, fontSize: "0.75rem" }}>{unit}</span>
                        ) : null}
                        <IconButton
                            size="small"
                            edge="end"
                            aria-label={`Increase ${label}`}
                            disabled={!canIncrement}
                            onClick={() => nudge(1)}>
                            <IconByName name="shapes.addCircle" fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            sx={{
                // The native spinners duplicate the steppers and are unusable at this size.
                "& input[type=number]": { MozAppearance: "textfield", textAlign: "center" },
                "& input[type=number]::-webkit-outer-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                },
                "& input[type=number]::-webkit-inner-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                },
            }}
        />
    );
}
