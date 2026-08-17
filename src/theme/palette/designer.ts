/**
 * Tokens for the workflow/job designers — the parts of a designer surface that stock MUI has no
 * vocabulary for: what a unit type looks like, what the canvas behind it looks like, and how a
 * setting that has been changed from its default reads.
 *
 * Kept out of `palette` proper because these are not MUI palette colors: consumers reach them as
 * `theme.designer.*`. Every value here is checked against its own background in
 * `tests/designerTokens.tests.ts`, so a future edit that makes a stripe invisible fails the build
 * rather than shipping.
 *
 * Brand hue is deliberately untouched — see SOF-8024 portion 2 §2, which gates the canonical
 * palette on design/marketing sign-off. Swapping it later is an edit to `palette/index.ts`, not
 * to this file.
 */

export interface UnitTypeToken {
    /** Accent for the type: the card stripe, the dropdown swatch, the node border. */
    main: string;
    /** Readable on `main` when it is used as a fill behind a label. */
    contrastText: string;
}

export interface DesignerTokens {
    unitType: Record<string, UnitTypeToken>;
    canvas: {
        background: string;
        grid: string;
        wire: string;
        selection: string;
        insertAffordance: string;
    };
    /** How a value that differs from its default, or is unsaved, reads. */
    state: {
        modified: string;
        dirty: string;
        draft: string;
    };
    node: {
        background: string;
        border: string;
        shadow: string;
        /** Below this a unit card stops being readable; the canvas clamps auto-fit to it. */
        minWidth: number;
    };
}

/**
 * Light-mode unit accents.
 *
 * These are fills — a 10 px stripe down a card, an 18 px swatch in a menu — so the bar is WCAG's
 * 3:1 for non-text UI against the white surface they sit on. The previous `#ff9800` and
 * `#00BFA5` sat at 2.15 and 2.14, which is why an assignment stripe was hard to pick out.
 */
const unitTypeLight: Record<string, UnitTypeToken> = {
    execution: { main: "#0288D1", contrastText: "#000000" },
    subworkflow: { main: "#3F51B5", contrastText: "#FFFFFF" },
    map: { main: "#2E7D32", contrastText: "#FFFFFF" },
    assignment: { main: "#B35C00", contrastText: "#FFFFFF" },
    condition: { main: "#00786A", contrastText: "#FFFFFF" },
    assertion: { main: "#BE134D", contrastText: "#FFFFFF" },
    io: { main: "#8E24AA", contrastText: "#FFFFFF" },
    processing: { main: "#546E7A", contrastText: "#FFFFFF" },
    error: { main: "#D32F2F", contrastText: "#FFFFFF" },
};

/** Dark-mode accents are lightened rather than reused: the light set sinks into a dark canvas. */
const unitTypeDark: Record<string, UnitTypeToken> = {
    execution: { main: "#4FC3F7", contrastText: "#000000" },
    subworkflow: { main: "#8C9EFF", contrastText: "#000000" },
    map: { main: "#81C784", contrastText: "#000000" },
    assignment: { main: "#FFB74D", contrastText: "#000000" },
    condition: { main: "#4DD0C4", contrastText: "#000000" },
    assertion: { main: "#F06292", contrastText: "#000000" },
    io: { main: "#CE93D8", contrastText: "#000000" },
    processing: { main: "#B0BEC5", contrastText: "#000000" },
    error: { main: "#EF5350", contrastText: "#000000" },
};

/** Node cards must stay readable; auto-fit clamps to this rather than shrinking past it. */
const NODE_MIN_WIDTH = 180;

export const designerLight: DesignerTokens = {
    unitType: unitTypeLight,
    canvas: {
        background: "#F7F7F9",
        grid: "#E1E1E6",
        wire: "#8A8A96",
        selection: "#5b37c0",
        insertAffordance: "#5b37c0",
    },
    state: {
        modified: "#B35C00",
        dirty: "#B35C00",
        draft: "#546E7A",
    },
    node: {
        background: "#FFFFFF",
        border: "#D8D8DF",
        shadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
        minWidth: NODE_MIN_WIDTH,
    },
};

export const designerDark: DesignerTokens = {
    unitType: unitTypeDark,
    canvas: {
        background: "#131318",
        grid: "#2A2A33",
        wire: "#6E6E7A",
        selection: "#7c5fcd",
        insertAffordance: "#7c5fcd",
    },
    state: {
        modified: "#FFB74D",
        dirty: "#FFB74D",
        draft: "#B0BEC5",
    },
    node: {
        background: "#1A1A1F",
        border: "#33333D",
        shadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
        minWidth: NODE_MIN_WIDTH,
    },
};

/**
 * The flat `name → color` shape the existing `palette.unitTypes` key exposes, derived from the
 * tokens above so the two cannot drift. wove reads it for card stripes and menu swatches.
 */
export function toUnitTypeColors(tokens: Record<string, UnitTypeToken>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(tokens).map(([name, token]) => [name, token.main]),
    ) as Record<string, string>;
}
