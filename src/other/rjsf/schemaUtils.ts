/* eslint-disable @typescript-eslint/no-explicit-any */
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import type { JSONSchema7 } from "json-schema";

/**
 * Generic deep-map for plain objects. Recursively applies `mapValue` to each
 * plain-object node. If `mapValue` returns a truthy value, that value replaces
 * the node (its children are still traversed). Non-plain objects, primitives,
 * and arrays of primitives are returned unchanged.
 *
 * NOTE: A copy of this function also lives in @mat3ra/utils (object module).
 * We inline it here to avoid adding @mat3ra/utils as a dependency of cove.
 */
function mapObjectDeep(object: any, mapValue: (node: any) => any | undefined): any {
    if (typeof object !== "object" || object === null) {
        return object;
    }

    if (Array.isArray(object)) {
        return object.map((innerValue) => mapObjectDeep(innerValue, mapValue));
    }

    if (object.constructor !== Object) {
        return object;
    }

    const mappedObject = mapValue(object) || object;

    const entries = Object.entries(mappedObject).map(([key, value]) => {
        return [key, mapObjectDeep(value, mapValue)];
    });

    return Object.fromEntries(entries);
}

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
export class UISchema {
    private schema: any;

    private resolvedSchema: any = {};

    private registry: UISchemaRegistry;

    constructor(schema: any, registry: UISchemaRegistry = {}) {
        this.schema = schema;
        this.registry = registry;
        this.resolveSchema();
    }

    resolveSchemaValues(schemaValues: any) {
        return mapObjectDeep(this.resolvedSchema, (nestedObject: any) => {
            const entries = Object.entries(nestedObject).map(([key, value]) => {
                if (typeof value === "string") {
                    const matched = value.match(/^\$val\.(.+)$/);

                    if (matched) {
                        if (schemaValues[matched[1]] !== undefined) {
                            return [key, schemaValues[matched[1]]];
                        }

                        console.warn(`Schema ${this.schema.$id} variable ${matched[1]} not found`);
                    }
                }

                return [key, value];
            });

            return Object.fromEntries(entries);
        });
    }

    resolveSchema() {
        if (this.schema.allOf) {
            this.schema.allOf.forEach(({ $ref }: any) => {
                if ($ref) {
                    const schema = this.registry[$ref];
                    if (schema) {
                        this.resolvedSchema = {
                            ...this.resolvedSchema,
                            ...schema.properties,
                        };
                    }
                }
            });
        }

        if (Object.entries(this.resolvedSchema).length === 0) {
            this.resolvedSchema = {
                ...this.schema.properties,
            };
        }
    }
}

/**
 * Resolve a JSON schema by ID from the ESSE schema registry.
 *
 * @param schemaId - The ESSE schema identifier.
 * @param removeRequired - If true, strips the `required` field from the result.
 * @returns The resolved JSON schema, or an empty object if not found.
 */
export function resolveJsonSchema(schemaId: string, removeRequired = false): JSONSchema7 {
    const schema = JSONSchemasInterface.getSchemaById(schemaId);
    if (!schema) {
        console.warn("Schema not found in ESSE:", schemaId);
        return {} as JSONSchema7;
    }
    if (removeRequired) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { required, ...optionalSchema } = schema as any;
        return optionalSchema as JSONSchema7;
    }
    return schema as JSONSchema7;
}

/**
 * Convenience factory: look up a UI schema by ID from a registry and wrap it
 * in a {@link UISchema} instance.
 *
 * @param schemaId - Key into the `registry` map.
 * @param registry - A map of schema IDs to raw JSON objects.
 * @throws If the schema ID is not found in the registry.
 */
export function resolveUISchema(schemaId: string, registry: UISchemaRegistry): UISchema {
    const schema = registry[schemaId];
    if (!schema) {
        throw new Error(`UI Schema is not found for ID: ${schemaId}`);
    }
    return new UISchema(schema, registry);
}
