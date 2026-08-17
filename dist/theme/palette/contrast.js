/**
 * WCAG relative-luminance contrast, used to choose readable `contrastText` values and to hold
 * the palette to them in tests rather than by eye.
 *
 * Kept here rather than pulled in as a dependency: it is thirty lines, and the palette should
 * not need one.
 */
/** Accepts `#rgb`, `#rrggbb`, `rgb(…)` and `rgba(…)`. */
export function parseColor(color) {
    var _a;
    if (color.startsWith("#")) {
        const hex = color.slice(1);
        const full = hex.length === 3
            ? hex
                .split("")
                .map((char) => char + char)
                .join("")
            : hex;
        return [
            parseInt(full.slice(0, 2), 16),
            parseInt(full.slice(2, 4), 16),
            parseInt(full.slice(4, 6), 16),
            1,
        ];
    }
    const match = color.match(/rgba?\(([^)]+)\)/);
    if (!match)
        throw new Error(`Unsupported color: ${color}`);
    const parts = match[1].split(",").map((part) => parseFloat(part.trim()));
    return [parts[0], parts[1], parts[2], (_a = parts[3]) !== null && _a !== void 0 ? _a : 1];
}
/**
 * Flattens a translucent foreground onto an opaque background.
 *
 * Without this a value like `rgba(0, 0, 0, 0.23)` looks like pure black and scores as if it were
 * readable, when what actually reaches the eye is 23% of it over whatever is behind.
 */
export function compositeOver(foreground, background) {
    const [r, g, b, alpha] = foreground;
    const [br, bg, bb] = background;
    return [
        r * alpha + br * (1 - alpha),
        g * alpha + bg * (1 - alpha),
        b * alpha + bb * (1 - alpha),
        1,
    ];
}
function relativeLuminance([r, g, b]) {
    const channel = (value) => {
        const scaled = value / 255;
        return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
/** Contrast ratio between two colors, 1 (identical) to 21 (black on white). */
export function contrastRatio(foreground, background) {
    const backgroundRgba = parseColor(background);
    const foregroundRgba = compositeOver(parseColor(foreground), backgroundRgba);
    const light = relativeLuminance(foregroundRgba);
    const dark = relativeLuminance(backgroundRgba);
    const [high, low] = light > dark ? [light, dark] : [dark, light];
    return (high + 0.05) / (low + 0.05);
}
/** WCAG 2.1 AA: 4.5 for body text, 3.0 for large text and non-text UI. */
export const AA_TEXT = 4.5;
export const AA_LARGE = 3;
/** Black or white, whichever is readable on `background` — the two the platform actually uses. */
export function readableTextOn(background) {
    return contrastRatio("#000000", background) >= contrastRatio("#FFFFFF", background)
        ? "#000000"
        : "#FFFFFF";
}
