/**
 * Bound arithmetic for `NumericStepperInput`, kept out of the component so it
 * can be asserted directly — the rules here are the difference between a form
 * that cannot be nudged into an invalid state and one that only complains
 * afterwards.
 */

export interface Bounds {
    min?: number;
    max?: number;
}

export function clampToBounds(value: number, { min, max }: Bounds): number {
    return Math.min(max ?? value, Math.max(min ?? value, value));
}

/**
 * Where one press of a stepper lands. Starts from `min` when nothing is set yet,
 * so the first press on an empty field offers the smallest legal value rather
 * than stepping up from an assumed zero.
 */
export function nextSteppedValue(
    value: number | undefined,
    direction: 1 | -1,
    step: number,
    bounds: Bounds,
): number {
    const base = value ?? bounds.min ?? 0;

    return clampToBounds(base + direction * step, bounds);
}

export function canDecrement(value: number | undefined, { min }: Bounds): boolean {
    return value !== undefined && (min === undefined || value > min);
}

export function canIncrement(value: number | undefined, { min, max }: Bounds): boolean {
    return max === undefined || (value ?? min ?? 0) < max;
}
