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
export declare function clampToBounds(value: number, { min, max }: Bounds): number;
/**
 * Where one press of a stepper lands. Starts from `min` when nothing is set yet,
 * so the first press on an empty field offers the smallest legal value rather
 * than stepping up from an assumed zero.
 */
export declare function nextSteppedValue(value: number | undefined, direction: 1 | -1, step: number, bounds: Bounds): number;
export declare function canDecrement(value: number | undefined, { min }: Bounds): boolean;
export declare function canIncrement(value: number | undefined, { min, max }: Bounds): boolean;
