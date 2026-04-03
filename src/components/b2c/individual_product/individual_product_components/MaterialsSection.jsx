import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const firstNonEmptyString = (...values) => {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return "";
};

const toDisplayLabel = (key) =>
    key
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (char) => char.toUpperCase());

const MaterialsSection = ({ product }) => {
    const [expanded, setExpanded] = useState(false);

    const materialsObj = product?.materials && typeof product.materials === "object" ? product.materials : null;

    const baseRows = [
        {
            label: "Primary Fabric",
            value: firstNonEmptyString(
                product?.primaryFabric,
                product?.fabric,
                product?.material,
                product?.materialType,
                materialsObj?.primaryFabric,
                materialsObj?.fabric,
                materialsObj?.material,
                materialsObj?.materialType
            ),
        },
        {
            label: "Fabric Sub-Category",
            value: firstNonEmptyString(
                product?.fabricSubCategory,
                materialsObj?.fabricSubCategory
            ),
        },
        {
            label: "Weave Type",
            value: firstNonEmptyString(
                product?.weaveType,
                materialsObj?.weaveType
            ),
        },
        {
            label: "Dress Sub-Category",
            value: firstNonEmptyString(
                product?.dressSubCategory,
                product?.subcategory,
                materialsObj?.dressSubCategory,
                materialsObj?.subcategory
            ),
        },
        {
            label: "Craft",
            value: firstNonEmptyString(
                product?.craft,
                materialsObj?.craft
            ),
        },
        {
            label: "Composition",
            value: firstNonEmptyString(
                product?.composition,
                product?.materialComposition,
                materialsObj?.composition,
                materialsObj?.materialComposition
            ),
        },
        {
            label: "Lining",
            value: firstNonEmptyString(product?.lining, materialsObj?.lining),
        },
        {
            label: "Work",
            value: firstNonEmptyString(
                product?.work,
                product?.embellishment,
                product?.embellishments,
                materialsObj?.work,
                materialsObj?.embellishment,
                materialsObj?.embellishments
            ),
        },
    ].filter((row) => row.value);

    const knownMaterialKeys = new Set([
        "primaryFabric",
        "fabric",
        "material",
        "materialType",
        "fabricSubCategory",
        "weaveType",
        "dressSubCategory",
        "subcategory",
        "craft",
        "composition",
        "materialComposition",
        "lining",
        "work",
        "embellishment",
        "embellishments",
    ]);

    const extraRows = materialsObj
        ? Object.entries(materialsObj)
            .filter(([key, value]) => !knownMaterialKeys.has(key) && typeof value === "string" && value.trim())
            .map(([key, value]) => ({
                label: toDisplayLabel(key),
                value: value.trim(),
            }))
        : [];

    const rows = [...baseRows, ...extraRows];

    return (
        <div className="w-full border-b border-gray-200">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
            >
                <h3 className="text-base font-semibold text-gray-900">Materials</h3>
                {expanded ? (
                    <ChevronUp size={20} className="text-gray-600" />
                ) : (
                    <ChevronDown size={20} className="text-gray-600" />
                )}
            </button>

            {expanded && (
                <div className="pb-4 text-sm text-gray-700 space-y-2">
                    {rows.length > 0 ? (
                        rows.map((row) => (
                            <div key={row.label}>
                                <span className="font-medium">{row.label}: </span>
                                <span>{row.value}</span>
                            </div>
                        ))
                    ) : (
                        <p>Material details not available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MaterialsSection;
