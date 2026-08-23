import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getMeterGeometry } from "../src/mui/components/metric/meterGeometry";
import {
    canDecrement,
    canIncrement,
    clampToBounds,
    nextSteppedValue,
} from "../src/mui/components/numeric-stepper/bounds";

describe("NumericStepperInput bounds", () => {
    const bounds = { min: 1, max: 4 };

    it("never steps outside the bounds", () => {
        assert.equal(nextSteppedValue(4, 1, 1, bounds), 4);
        assert.equal(nextSteppedValue(1, -1, 1, bounds), 1);
    });

    it("offers the smallest legal value on the first press of an empty field", () => {
        // Stepping up from an assumed zero would ask for 1 core on a form whose
        // minimum is 4, which the reader then has to fix.
        assert.equal(nextSteppedValue(undefined, 1, 1, { min: 4, max: 32 }), 5);
        assert.equal(nextSteppedValue(undefined, -1, 1, { min: 4, max: 32 }), 4);
    });

    it("honours a step larger than one without overshooting the max", () => {
        assert.equal(nextSteppedValue(30, 1, 4, { min: 1, max: 32 }), 32);
    });

    it("leaves an unbounded field unbounded", () => {
        assert.equal(clampToBounds(9999, {}), 9999);
        assert.equal(nextSteppedValue(9999, 1, 1, {}), 10000);
    });

    it("disables the steppers exactly at the bounds", () => {
        assert.equal(canIncrement(4, bounds), false);
        assert.equal(canIncrement(3, bounds), true);
        assert.equal(canDecrement(1, bounds), false);
        assert.equal(canDecrement(2, bounds), true);
    });

    it("cannot decrement a field with nothing in it", () => {
        assert.equal(canDecrement(undefined, bounds), false);
        assert.equal(canIncrement(undefined, bounds), true);
    });
});

describe("SegmentedMeter geometry", () => {
    it("divides the bar in proportion to the total", () => {
        const { widths, isOverflowing } = getMeterGeometry({ values: [120, 64], total: 500 });
        assert.deepEqual(widths, [24, 12.8]);
        assert.equal(isOverflowing, false);
    });

    it("rescales rather than clipping when the segments exceed the total", () => {
        // Clamping at 100% would draw an over-quota job identically to one that
        // exactly fits — the one comparison the meter exists to make.
        const { widths, isOverflowing, used } = getMeterGeometry({
            values: [120, 1536],
            total: 500,
        });
        assert.equal(isOverflowing, true);
        assert.equal(used, 1656);
        assert.equal(Math.round(widths[0] + widths[1]), 100);
        assert.ok(widths[1] > widths[0] * 10);
    });

    it("treats a full bar as full, not as overflowing", () => {
        assert.equal(getMeterGeometry({ values: [500], total: 500 }).isOverflowing, false);
    });

    it("ignores negative segments rather than subtracting width", () => {
        assert.deepEqual(getMeterGeometry({ values: [-50, 250], total: 500 }).widths, [0, 50]);
    });

    it("survives a total of zero", () => {
        const { widths, isOverflowing } = getMeterGeometry({ values: [0], total: 0 });
        assert.deepEqual(widths, [0]);
        assert.equal(isOverflowing, false);
    });
});
