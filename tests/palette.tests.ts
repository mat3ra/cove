import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { contrastRatio } from "../src/theme/palette/contrast";
import { paletteDark, paletteLight, StatusToneName } from "../src/theme/palette";

/** WCAG 2.1 AA for normal-size text. */
const TEXT_CONTRAST_MINIMUM = 4.5;
/**
 * Chip outlines are decorative reinforcement, not the thing that identifies the
 * component: a StatusChip is identified by its icon and label, and both are held
 * to `TEXT_CONTRAST_MINIMUM` above — which is what keeps status off color-alone.
 * WCAG 1.4.11's 3:1 governs boundaries that carry that identifying job (an empty
 * input's outline, say); it does not apply here, and forcing it would mean heavy
 * outlines on every chip. What the outline does owe the reader is being visible
 * at all, so it is held to a perceptible-edge floor instead.
 */
const PERCEPTIBLE_EDGE_MINIMUM = 1.5;

const TONE_NAMES: StatusToneName[] = ["neutral", "primary", "info", "success", "warning", "error"];

const THEMES = [
    { name: "light", palette: paletteLight },
    { name: "dark", palette: paletteDark },
];

describe("contrast helpers", () => {
    it("computes the known black-on-white ratio", () => {
        assert.equal(Math.round(contrastRatio("#000000", "#FFFFFF")), 21);
    });

    it("treats a translucent foreground as composited, not opaque", () => {
        // 23%-alpha black is nearly invisible on red; opaque black is not.
        assert.ok(contrastRatio("rgba(0, 0, 0, 0.23)", "#D32F2F") < 1.5);
        assert.ok(contrastRatio("#000000", "#D32F2F") > 3);
    });

    it("composites a translucent background onto the surface below it", () => {
        const onWhite = contrastRatio("#3D7A15", "rgba(114, 225, 40, 0.20)", "#FFFFFF");
        const onBlack = contrastRatio("#3D7A15", "rgba(114, 225, 40, 0.20)", "#000000");
        assert.notEqual(Math.round(onWhite), Math.round(onBlack));
    });
});

describe("status colors", () => {
    for (const { name, palette } of THEMES) {
        for (const colorName of ["success", "error", "warning", "info"] as const) {
            it(`${name}: ${colorName}.contrastText is readable on ${colorName}.main`, () => {
                const { main, contrastText } = palette[colorName];
                const ratio = contrastRatio(contrastText, main);
                assert.ok(
                    ratio >= TEXT_CONTRAST_MINIMUM,
                    `${colorName}.contrastText on ${colorName}.main is ${ratio.toFixed(2)}:1, ` +
                        `below the ${TEXT_CONTRAST_MINIMUM}:1 minimum`,
                );
            });
        }
    }
});

describe("status tones", () => {
    for (const { name, palette } of THEMES) {
        const surface = palette.background.paper;

        for (const tone of TONE_NAMES) {
            it(`${name}: ${tone} ink is readable on its own tint`, () => {
                const { color, background } = palette.statusTones[tone];
                const ratio = contrastRatio(color, background, surface);
                assert.ok(
                    ratio >= TEXT_CONTRAST_MINIMUM,
                    `${tone}.color on ${tone}.background over ${surface} is ` +
                        `${ratio.toFixed(2)}:1, below the ${TEXT_CONTRAST_MINIMUM}:1 minimum`,
                );
            });

            it(`${name}: ${tone} ink stays readable directly on the surface`, () => {
                // Chips are not always painted on their tint — a rail row may show the
                // ink alone. It has to hold up there too.
                const { color } = palette.statusTones[tone];
                const ratio = contrastRatio(color, surface);
                assert.ok(
                    ratio >= TEXT_CONTRAST_MINIMUM,
                    `${tone}.color on ${surface} is ${ratio.toFixed(2)}:1, ` +
                        `below the ${TEXT_CONTRAST_MINIMUM}:1 minimum`,
                );
            });

            it(`${name}: ${tone} outline is a perceptible edge`, () => {
                const { border } = palette.statusTones[tone];
                const ratio = contrastRatio(border, surface);
                assert.ok(
                    ratio >= PERCEPTIBLE_EDGE_MINIMUM,
                    `${tone}.border on ${surface} is ${ratio.toFixed(2)}:1, ` +
                        `below the ${PERCEPTIBLE_EDGE_MINIMUM}:1 perceptible-edge floor`,
                );
            });

            it(`${name}: ${tone} tint is distinguishable from the bare surface`, () => {
                // The chip needs a visible body, not just an outline — otherwise a
                // "soft" chip is indistinguishable from plain text on the card.
                const { background } = palette.statusTones[tone];
                const ratio = contrastRatio(background, surface);
                assert.ok(
                    ratio >= 1.03,
                    `${tone}.background over ${surface} is ${ratio.toFixed(3)}:1 — ` +
                        `the tint is invisible against the surface`,
                );
            });
        }
    }
});

describe("palette completeness", () => {
    const SHARED_SLOTS = [
        "text",
        "action",
        "unitTypes",
        "background",
        "border",
        "icon",
        "statusTones",
        "primary",
        "secondary",
        "success",
        "error",
        "warning",
        "info",
    ] as const;

    for (const slot of SHARED_SLOTS) {
        it(`dark palette defines "${slot}"`, () => {
            // Regression guard: paletteDark used to omit every slot below the status
            // colors, so consumers reading e.g. palette.border.main in dark mode got
            // undefined and silently fell back to light-mode styling.
            assert.ok(paletteDark[slot], `paletteDark.${slot} is missing`);
        });
    }

    it("dark palette covers exactly the light palette's slots", () => {
        assert.deepEqual(Object.keys(paletteDark).sort(), Object.keys(paletteLight).sort());
    });
});
