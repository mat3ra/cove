import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AA_LARGE, AA_TEXT, contrastRatio, readableTextOn } from "../src/theme/palette/contrast";
import { designerDark, designerLight, paletteDark, paletteLight } from "../src/theme/palette";

const SEMANTIC = ["success", "error", "warning", "info"] as const;

describe("contrast helper", () => {
    it("scores the extremes as WCAG does", () => {
        assert.equal(Math.round(contrastRatio("#000000", "#FFFFFF")), 21);
        assert.equal(contrastRatio("#FFFFFF", "#FFFFFF"), 1);
    });

    it("flattens a translucent foreground instead of scoring it as opaque", () => {
        // Pure black on red passes; 23% of it does not — the difference the old palette missed.
        assert.ok(contrastRatio("#000000", "#D32F2F") > 4);
        assert.ok(contrastRatio("rgba(0, 0, 0, 0.23)", "#D32F2F") < 2);
    });

    it("picks whichever of black or white actually reads", () => {
        assert.equal(readableTextOn("#72E128"), "#000000");
        assert.equal(readableTextOn("#D32F2F"), "#FFFFFF");
    });
});

describe("semantic palette", () => {
    SEMANTIC.forEach((name) => {
        it(`${name}.contrastText is readable on ${name}.main, in both palettes`, () => {
            [paletteLight, paletteDark].forEach((palette) => {
                const { main, contrastText } = palette[name];
                const ratio = contrastRatio(contrastText, main);
                assert.ok(
                    ratio >= AA_TEXT,
                    `${name}: ${contrastText} on ${main} is ${ratio.toFixed(2)}, below ${AA_TEXT}`,
                );
            });
        });
    });

    it("offers a success colour that can be read as text on its own ground", () => {
        // `success.main` and `success.dark` are both too light for text on white, which is why
        // `successText` exists rather than callers reaching for `dark` and hoping.
        assert.ok(contrastRatio(paletteLight.success.main, "#FFFFFF") < AA_TEXT);
        assert.ok(contrastRatio(paletteLight.successText, paletteLight.background.paper) >= AA_TEXT);
        assert.ok(contrastRatio(paletteDark.successText, paletteDark.background.paper) >= AA_TEXT);
    });
});

describe("dark palette completeness", () => {
    /**
     * `theme.palette.border.dark` is read unguarded by TextEditor, TotalWidget and InfoWidget.
     * The dark palette used to omit the whole group, so those threw in dark mode.
     */
    it("carries every key the light palette declares", () => {
        const missing = Object.keys(paletteLight).filter(
            (key) => !(key in (paletteDark as Record<string, unknown>)),
        );
        assert.deepEqual(missing, []);
    });

    it("defines the surface and border tokens components dereference", () => {
        assert.ok(paletteDark.border.dark);
        assert.ok(paletteDark.border.main);
        assert.ok(paletteDark.icon.main);
        assert.ok(paletteDark.background.paper);
        assert.ok(paletteDark.unitTypes.execution);
    });

    it("uses dark surfaces rather than the light ones", () => {
        assert.notEqual(paletteDark.background.paper, paletteLight.background.paper);
        assert.ok(
            contrastRatio(paletteDark.text.primary, paletteDark.background.paper) >= AA_TEXT,
        );
    });
});

describe("designer tokens", () => {
    const modes = [
        { name: "light", tokens: designerLight },
        { name: "dark", tokens: designerDark },
    ];

    modes.forEach(({ name, tokens }) => {
        it(`${name}: every unit-type accent is visible on the node it marks`, () => {
            Object.entries(tokens.unitType).forEach(([type, token]) => {
                const ratio = contrastRatio(token.main, tokens.node.background);
                assert.ok(
                    ratio >= AA_LARGE,
                    `${name}/${type}: ${token.main} on ${tokens.node.background} is ${ratio.toFixed(
                        2,
                    )}, below ${AA_LARGE}`,
                );
            });
        });

        it(`${name}: every unit-type accent can carry its own label`, () => {
            Object.entries(tokens.unitType).forEach(([type, token]) => {
                const ratio = contrastRatio(token.contrastText, token.main);
                assert.ok(
                    ratio >= AA_TEXT,
                    `${name}/${type}: label ${token.contrastText} on ${
                        token.main
                    } is ${ratio.toFixed(2)}`,
                );
            });
        });

        it(`${name}: unit-type accents are distinguishable from each other`, () => {
            // Not a substitute for the type icons — hue is never the only signal — but two
            // accents this close would read as the same type at a glance.
            const entries = Object.entries(tokens.unitType);
            entries.forEach(([leftName, left], i) => {
                entries.slice(i + 1).forEach(([rightName, right]) => {
                    const distance = colorDistance(left.main, right.main);
                    assert.ok(
                        distance >= 40,
                        `${name}: ${leftName} and ${rightName} differ by only ${distance.toFixed(1)}`,
                    );
                });
            });
        });

        it(`${name}: the modified state reads against the surface it sits on`, () => {
            assert.ok(contrastRatio(tokens.state.modified, tokens.node.background) >= AA_LARGE);
            assert.ok(contrastRatio(tokens.state.draft, tokens.node.background) >= AA_LARGE);
        });

        it(`${name}: canvas furniture is visible without shouting`, () => {
            const { canvas, node } = tokens;
            assert.ok(contrastRatio(canvas.wire, canvas.background) >= AA_LARGE);
            // The grid is meant to be felt, not read: present but below the wire's weight.
            assert.ok(contrastRatio(canvas.grid, canvas.background) < AA_LARGE);
            assert.ok(contrastRatio(node.background, canvas.background) > 1);
        });
    });

    it("keeps a node wide enough to read, in both modes", () => {
        assert.equal(designerLight.node.minWidth, designerDark.node.minWidth);
        assert.ok(designerLight.node.minWidth >= 160);
    });

    it("covers every unit type the designers can create", () => {
        const expected = [
            "execution",
            "subworkflow",
            "map",
            "assignment",
            "condition",
            "assertion",
            "io",
            "processing",
            "error",
        ];
        modes.forEach(({ name, tokens }) => {
            expected.forEach((type) =>
                assert.ok(type in tokens.unitType, `${name} is missing ${type}`),
            );
        });
    });

    it("exposes the flat shape wove reads for card stripes", () => {
        assert.equal(paletteLight.unitTypes.execution, designerLight.unitType.execution.main);
        assert.equal(paletteDark.unitTypes.execution, designerDark.unitType.execution.main);
    });
});

/** Euclidean distance in sRGB — crude, but enough to catch two accents chosen too close. */
function colorDistance(left: string, right: string): number {
    const parse = (color: string) => [
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16),
    ];
    const [lr, lg, lb] = parse(left);
    const [rr, rg, rb] = parse(right);
    return Math.sqrt((lr - rr) ** 2 + (lg - rg) ** 2 + (lb - rb) ** 2);
}
