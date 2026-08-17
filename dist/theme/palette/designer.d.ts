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
export declare const designerLight: DesignerTokens;
export declare const designerDark: DesignerTokens;
/**
 * The flat `name → color` shape the existing `palette.unitTypes` key exposes, derived from the
 * tokens above so the two cannot drift. wove reads it for card stripes and menu swatches.
 */
export declare function toUnitTypeColors(tokens: Record<string, UnitTypeToken>): Record<string, string>;
