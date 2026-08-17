/**
 * WCAG relative-luminance contrast, used to choose readable `contrastText` values and to hold
 * the palette to them in tests rather than by eye.
 *
 * Kept here rather than pulled in as a dependency: it is thirty lines, and the palette should
 * not need one.
 */
type Rgba = [number, number, number, number];
/** Accepts `#rgb`, `#rrggbb`, `rgb(…)` and `rgba(…)`. */
export declare function parseColor(color: string): Rgba;
/**
 * Flattens a translucent foreground onto an opaque background.
 *
 * Without this a value like `rgba(0, 0, 0, 0.23)` looks like pure black and scores as if it were
 * readable, when what actually reaches the eye is 23% of it over whatever is behind.
 */
export declare function compositeOver(foreground: Rgba, background: Rgba): Rgba;
/** Contrast ratio between two colors, 1 (identical) to 21 (black on white). */
export declare function contrastRatio(foreground: string, background: string): number;
/** WCAG 2.1 AA: 4.5 for body text, 3.0 for large text and non-text UI. */
export declare const AA_TEXT = 4.5;
export declare const AA_LARGE = 3;
/** Black or white, whichever is readable on `background` — the two the platform actually uses. */
export declare function readableTextOn(background: string): "#000000" | "#FFFFFF";
export {};
