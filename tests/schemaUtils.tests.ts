import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { UISchema, resolveUISchema } from "../src/other/rjsf/schemaUtils";
import type { UISchemaRegistry } from "../src/other/rjsf/schemaUtils";

describe("UISchema", () => {
    it("resolves properties from a flat schema", () => {
        const schema = {
            properties: {
                ppn: { "ui:widget": "updown", "ui:title": "PPN" },
            },
        };
        const uiSchema = new UISchema(schema);
        const resolved = uiSchema.resolveSchemaValues({});
        assert.deepStrictEqual(resolved, {
            ppn: { "ui:widget": "updown", "ui:title": "PPN" },
        });
    });

    it("resolves $val.* variables from schemaValues", () => {
        const schema = {
            properties: {
                ppn: { "ui:widget": "updown", "ui:options": { default: "$val.defaultPpn" } },
            },
        };
        const uiSchema = new UISchema(schema);
        const resolved = uiSchema.resolveSchemaValues({ defaultPpn: 4 });
        assert.deepStrictEqual(resolved, {
            ppn: { "ui:widget": "updown", "ui:options": { default: 4 } },
        });
    });

    it("composes allOf.$ref schemas from registry", () => {
        const registry: UISchemaRegistry = {
            base: {
                properties: {
                    ppn: { "ui:widget": "updown" },
                },
            },
            extra: {
                properties: {
                    queue: { "ui:widget": "select" },
                },
            },
        };
        const schema = {
            allOf: [{ $ref: "base" }, { $ref: "extra" }],
        };
        const uiSchema = new UISchema(schema, registry);
        const resolved = uiSchema.resolveSchemaValues({});
        assert.deepStrictEqual(resolved, {
            ppn: { "ui:widget": "updown" },
            queue: { "ui:widget": "select" },
        });
    });
});

describe("resolveUISchema", () => {
    it("returns a UISchema instance for a known ID", () => {
        const registry: UISchemaRegistry = {
            "job/compute/base": {
                properties: {
                    ppn: { "ui:widget": "updown" },
                },
            },
        };
        const uiSchema = resolveUISchema("job/compute/base", registry);
        assert.ok(uiSchema instanceof UISchema);
    });

    it("throws for unknown schema ID", () => {
        assert.throws(() => resolveUISchema("nonexistent", {}), {
            message: "UI Schema is not found for ID: nonexistent",
        });
    });
});
