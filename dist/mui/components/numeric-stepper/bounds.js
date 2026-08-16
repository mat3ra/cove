/**
 * Bound arithmetic for `NumericStepperInput`, kept out of the component so it
 * can be asserted directly — the rules here are the difference between a form
 * that cannot be nudged into an invalid state and one that only complains
 * afterwards.
 */
export function clampToBounds(value, { min, max }) {
    return Math.min(max !== null && max !== void 0 ? max : value, Math.max(min !== null && min !== void 0 ? min : value, value));
}
/**
 * Where one press of a stepper lands. Starts from `min` when nothing is set yet,
 * so the first press on an empty field offers the smallest legal value rather
 * than stepping up from an assumed zero.
 */
export function nextSteppedValue(value, direction, step, bounds) {
    var _a;
    const base = (_a = value !== null && value !== void 0 ? value : bounds.min) !== null && _a !== void 0 ? _a : 0;
    return clampToBounds(base + direction * step, bounds);
}
export function canDecrement(value, { min }) {
    return value !== undefined && (min === undefined || value > min);
}
export function canIncrement(value, { min, max }) {
    var _a;
    return max === undefined || ((_a = value !== null && value !== void 0 ? value : min) !== null && _a !== void 0 ? _a : 0) < max;
}
