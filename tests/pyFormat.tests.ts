import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { shortenQualifiedNames } from "../src/other/codemirror/utils/pyFormat";

describe("shortenQualifiedNames", () => {
    it("collapses a dotted module path to the class name", () => {
        assert.equal(shortenQualifiedNames("mat3ra.made.material.Material"), "Material");
    });

    it("collapses every qualified name inside a Union", () => {
        assert.equal(
            shortenQualifiedNames(
                "crystal: Union[mat3ra.made.material.Material, " +
                    "mat3ra.made.tools.build_components.metadata.material_with_build_metadata.MaterialWithBuildMetadata]",
            ),
            "crystal: Union[Material, MaterialWithBuildMetadata]",
        );
    });

    it("leaves numeric literals and plain generics untouched", () => {
        assert.equal(shortenQualifiedNames("vacuum: float = 10.0"), "vacuum: float = 10.0");
        assert.equal(
            shortenQualifiedNames("miller_indices: Tuple[int, int, int] = (0, 0, 1)"),
            "miller_indices: Tuple[int, int, int] = (0, 0, 1)",
        );
    });

    it("collapses a qualified type inside Optional", () => {
        assert.equal(
            shortenQualifiedNames(
                "termination_top: Optional[mat3ra.made.tools.build_components.entities.auxiliary.two_dimensional.termination.Termination] = None",
            ),
            "termination_top: Optional[Termination] = None",
        );
    });
});
