import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getLifecycleStages } from "../src/mui/components/lifecycle/lifecycleStages";

const stateById = (stages: ReturnType<typeof getLifecycleStages>) =>
    Object.fromEntries(stages.map((stage) => [stage.id, stage.state]));

describe("getLifecycleStages — the ordinary path", () => {
    it("puts a draft at the first stage with the rest still to come", () => {
        const stages = getLifecycleStages({ status: "pre-submission" });
        assert.deepEqual(stateById(stages), {
            draft: "current",
            queued: "upcoming",
            running: "upcoming",
            finished: "upcoming",
        });
    });

    it("marks everything behind the current stage as done", () => {
        assert.deepEqual(stateById(getLifecycleStages({ status: "active" })), {
            draft: "done",
            queued: "done",
            running: "current",
            finished: "upcoming",
        });
    });

    it("treats submitted and queued as the same stage", () => {
        assert.equal(
            stateById(getLifecycleStages({ status: "submitted" })).queued,
            stateById(getLifecycleStages({ status: "queued" })).queued,
        );
    });

    it("ends on Finished with nothing left upcoming", () => {
        assert.deepEqual(stateById(getLifecycleStages({ status: "finished" })), {
            draft: "done",
            queued: "done",
            running: "done",
            finished: "current",
        });
    });
});

describe("getLifecycleStages — failures", () => {
    const track = [
        { status: "pre-submission", trackedAt: 100 },
        { status: "submitted", trackedAt: 200 },
        { status: "active", trackedAt: 300 },
        { status: "error", trackedAt: 400 },
    ];

    it("shows the failure in place of a finish that never came", () => {
        const stages = getLifecycleStages({ status: "error", statusTrack: track });
        assert.equal(stages[3].id, "failed");
        assert.equal(stages[3].label, "Error");
        assert.equal(stages[3].state, "failed");
        assert.equal(stages[3].at, 400);
    });

    it("keeps the stages the job did reach", () => {
        const stages = getLifecycleStages({ status: "error", statusTrack: track });
        assert.deepEqual(
            stages.slice(0, 3).map((stage) => stage.state),
            ["done", "done", "current"],
        );
    });

    it("marks stages the job never reached as skipped, not pending", () => {
        // A job that died in the queue never ran; "upcoming" would suggest it
        // still might.
        const stages = getLifecycleStages({
            status: "terminated",
            statusTrack: [
                { status: "pre-submission", trackedAt: 100 },
                { status: "submitted", trackedAt: 200 },
            ],
        });
        assert.deepEqual(stateById(stages), {
            draft: "done",
            queued: "current",
            running: "skipped",
            failed: "failed",
        });
    });

    it("names each kind of ending rather than calling them all errors", () => {
        const label = (status: string) =>
            getLifecycleStages({ status, statusTrack: track }).at(-1)?.label;
        assert.equal(label("error"), "Error");
        assert.equal(label("terminated"), "Terminated");
        assert.equal(label("timeout"), "Timed out");
    });

    it("assumes a failure with an unreadable track at least got queued", () => {
        const stages = getLifecycleStages({ status: "error", statusTrack: [] });
        assert.equal(stateById(stages).queued, "current");
        assert.equal(stages.at(-1)?.state, "failed");
    });
});

describe("getLifecycleStages — timestamps", () => {
    it("takes the earliest entry for a stage, not the latest", () => {
        // A job requeued after a retry entered "Queued" once, at the first time.
        const stages = getLifecycleStages({
            status: "active",
            statusTrack: [
                { status: "queued", trackedAt: 500 },
                { status: "submitted", trackedAt: 200 },
            ],
        });
        assert.equal(stages.find((stage) => stage.id === "queued")?.at, 200);
    });

    it("leaves a stage without a timestamp rather than inventing one", () => {
        const stages = getLifecycleStages({ status: "active" });
        assert.deepEqual(
            stages.map((stage) => stage.at),
            [undefined, undefined, undefined, undefined],
        );
    });

    it("ignores unreadable timestamps", () => {
        const stages = getLifecycleStages({
            status: "active",
            statusTrack: [{ status: "active", trackedAt: Number.NaN }],
        });
        assert.equal(stages.find((stage) => stage.id === "running")?.at, undefined);
    });
});

describe("getLifecycleStages — robustness", () => {
    it("falls back to the first stage for a status it has never seen", () => {
        assert.equal(stateById(getLifecycleStages({ status: "something-new" })).draft, "current");
    });

    it("renders a job with no status at all", () => {
        assert.equal(getLifecycleStages({}).length, 4);
    });

    it("carries an icon on every stage, so state is never colour alone", () => {
        const stages = getLifecycleStages({ status: "error", statusTrack: [] });
        assert.ok(stages.every((stage) => Boolean(stage.iconName)));
    });
});
