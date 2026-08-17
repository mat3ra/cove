/**
 * Minimal WCAG 2.1 relative-luminance and contrast helpers.
 *
 * These exist so the status palette can be *checked* rather than eyeballed:
 * `tests/palette.tests.ts` asserts that every status tone clears the 4.5:1
 * text threshold against the surface it is actually painted on, in both
 * themes. They are exported because picking a readable ink for an arbitrary
 * background is a recurring need in consumers too.
 */
export interface RedGreenBlueAlpha {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}
/** Accepts `#abc`, `#aabbcc`, `#aabbccdd`, `rgb(r, g, b)` and `rgba(r, g, b, a)`. */
export declare function parseColor(color: string): RedGreenBlueAlpha;
/** Flattens a translucent color onto an opaque one, as the browser would paint it. */
export declare function compositeOver(foreground: RedGreenBlueAlpha, background: RedGreenBlueAlpha): RedGreenBlueAlpha;
export declare function relativeLuminance(color: RedGreenBlueAlpha): number;
/**
 * WCAG contrast ratio between two colors, each of which may be translucent.
 * Translucent inputs are composited onto `surface` first — the color a
 * translucent chip background is *painted on* decides what the reader sees.
 */
export declare function contrastRatio(foregroundColor: string, backgroundColor: string, surface?: string): number;
