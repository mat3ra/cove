import type { JSONSchema7 } from "json-schema";
/**
 * A registry type mapping schema IDs to their raw JSON content.
 * Consumers provide this when constructing a UISchema so the schema
 * resolution stays decoupled from any particular set of UI schemas.
 */
export type UISchemaRegistry = Record<string, any>;
/**
 * Wraps a raw UI schema object with `$val.*` variable resolution
 * and `allOf.$ref` composition support.
 *
 * @example
 * ```ts
 * const registry: UISchemaRegistry = { "job/compute/base": baseSchema };
 * const uiSchema = new UISchema(registry["job/compute/base"], registry);
 * const resolved = uiSchema.resolveSchemaValues({ ppPerNode: 4 });
 * ```
 */
export declare class UISchema {
    private schema;
    private resolvedSchema;
    private registry;
    constructor(schema: any, registry?: UISchemaRegistry);
    resolveSchemaValues(schemaValues: any): any;
    resolveSchema(): void;
}
/**
 * Resolve a JSON schema by ID from the ESSE schema registry.
 *
 * @param schemaId - The ESSE schema identifier.
 * @param removeRequired - If true, strips the `required` field from the result.
 * @returns The resolved JSON schema, or an empty object if not found.
 */
export declare function resolveJsonSchema(schemaId: string, removeRequired?: boolean): JSONSchema7;
/**
 * Convenience factory: look up a UI schema by ID from a registry and wrap it
 * in a {@link UISchema} instance.
 *
 * @param schemaId - Key into the `registry` map.
 * @param registry - A map of schema IDs to raw JSON objects.
 * @throws If the schema ID is not found in the registry.
 */
export declare function resolveUISchema(schemaId: string, registry: UISchemaRegistry): UISchema;
