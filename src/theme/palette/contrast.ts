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

const HEX_SHORTHAND_LENGTH = 4; // "#abc"

function parseHexColor(color: string): RedGreenBlueAlpha {
    const hex =
        color.length === HEX_SHORTHAND_LENGTH
            ? color
                  .slice(1)
                  .split("")
                  .map((character) => character + character)
                  .join("")
            : color.slice(1);

    return {
        red: parseInt(hex.slice(0, 2), 16),
        green: parseInt(hex.slice(2, 4), 16),
        blue: parseInt(hex.slice(4, 6), 16),
        alpha: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
}

function parseFunctionalColor(color: string): RedGreenBlueAlpha {
    const values = color
        .slice(color.indexOf("(") + 1, color.lastIndexOf(")"))
        .split(",")
        .map((part) => Number(part.trim()));

    return {
        red: values[0],
        green: values[1],
        blue: values[2],
        alpha: values.length > 3 ? values[3] : 1,
    };
}

/** Accepts `#abc`, `#aabbcc`, `#aabbccdd`, `rgb(r, g, b)` and `rgba(r, g, b, a)`. */
export function parseColor(color: string): RedGreenBlueAlpha {
    const normalized = color.trim();

    if (normalized.startsWith("#")) return parseHexColor(normalized);
    if (normalized.startsWith("rgb")) return parseFunctionalColor(normalized);

    throw new Error(`parseColor: unsupported color notation "${color}"`);
}

/** Flattens a translucent color onto an opaque one, as the browser would paint it. */
export function compositeOver(
    foreground: RedGreenBlueAlpha,
    background: RedGreenBlueAlpha,
): RedGreenBlueAlpha {
    const blend = (foregroundChannel: number, backgroundChannel: number) =>
        foregroundChannel * foreground.alpha + backgroundChannel * (1 - foreground.alpha);

    return {
        red: blend(foreground.red, background.red),
        green: blend(foreground.green, background.green),
        blue: blend(foreground.blue, background.blue),
        alpha: 1,
    };
}

export function relativeLuminance(color: RedGreenBlueAlpha): number {
    const channelLuminance = (channel: number) => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };

    return (
        0.2126 * channelLuminance(color.red) +
        0.7152 * channelLuminance(color.green) +
        0.0722 * channelLuminance(color.blue)
    );
}

/**
 * WCAG contrast ratio between two colors, each of which may be translucent.
 * Translucent inputs are composited onto `surface` first — the color a
 * translucent chip background is *painted on* decides what the reader sees.
 */
export function contrastRatio(
    foregroundColor: string,
    backgroundColor: string,
    surface = "#FFFFFF",
): number {
    const surfaceColor = parseColor(surface);
    const background = compositeOver(parseColor(backgroundColor), surfaceColor);
    const foreground = compositeOver(parseColor(foregroundColor), background);

    const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
    const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

    return (lighter + 0.05) / (darker + 0.05);
}
