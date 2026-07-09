/**
 * Icon name constants for use with IconByName — co-located with the icon registry.
 * These string values must match the keys defined in IconByName.tsx.
 */
export declare const ENTITY_ICONS: {
    readonly workflow: "entities.workflow";
    readonly unit: "entities.unit";
    readonly subworkflow: "entities.subworkflow";
    readonly material: "entities.material";
};
export type EntityIconKey = keyof typeof ENTITY_ICONS;
