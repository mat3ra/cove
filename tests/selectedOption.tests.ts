import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    isRestorableOptionId,
    resolveSelectedOption,
} from "../src/mui/components/button/selectedOption";

const save = { id: "save", label: "Save" };
const saveAndExit = { id: "save-and-exit", label: "Save & Exit" };

describe("resolveSelectedOption", () => {
    it("falls back to the first option when nothing is selected", () => {
        assert.equal(resolveSelectedOption([save, saveAndExit], null), save);
    });

    it("returns the option the id names", () => {
        assert.equal(resolveSelectedOption([save, saveAndExit], "save-and-exit"), saveAndExit);
    });

    it("resolves against the options given now, not the ones it was given first", () => {
        // The bug this exists for: the component held the selected *config object*
        // from mount and never resynced, so it kept calling the very first onClick
        // closure it ever received. A parent re-rendering with fresh handlers was
        // ignored for the component's lifetime.
        const first = { id: "save", label: "Save", onClick: () => "stale" };
        const later = { id: "save", label: "Save", onClick: () => "fresh" };
        assert.equal(resolveSelectedOption([later], "save").onClick(), "fresh");
        assert.notEqual(resolveSelectedOption([later], "save"), first);
    });

    it("falls back rather than rendering nothing when the remembered id is gone", () => {
        // A choice persisted in localStorage can name an option a later release
        // removed.
        assert.equal(resolveSelectedOption([save], "save-and-exit"), save);
    });

    it("returns undefined for an empty option list rather than dereferencing it", () => {
        assert.equal(resolveSelectedOption([], "save"), undefined);
    });
});

describe("isRestorableOptionId", () => {
    it("restores an id that still names an option", () => {
        assert.equal(isRestorableOptionId([save, saveAndExit], "save-and-exit"), true);
    });

    it("refuses an id nothing answers to", () => {
        assert.equal(isRestorableOptionId([save], "save-and-exit"), false);
        assert.equal(isRestorableOptionId([], "save"), false);
    });

    it("treats an absent id as nothing to restore", () => {
        assert.equal(isRestorableOptionId([save], null), false);
    });
});
