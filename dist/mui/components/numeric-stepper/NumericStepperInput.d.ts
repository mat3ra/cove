import React from "react";
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
export default function NumericStepperInput({ label, value, onChange, min, max, step, unit, helperText, error, disabled, size, id, className, }: NumericStepperInputProps): React.JSX.Element;
