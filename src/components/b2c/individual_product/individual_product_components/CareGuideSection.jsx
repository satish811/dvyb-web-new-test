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

const normalizeToStringList = (value) => {
    if (Array.isArray(value)) {
        return value
            .filter((item) => typeof item === "string" && item.trim())
            .map((item) => item.trim());
    }
    if (typeof value === "string" && value.trim()) {
        return value
            .split(/\r?\n|\.|;/)
            .map((part) => part.trim())
            .filter(Boolean);
    }
    return [];
};

const CareGuideSection = ({ product }) => {
    const [expanded, setExpanded] = useState(false);

    const careText = firstNonEmptyString(
        product?.care,
        product?.careGuide,
        product?.careInstructionsText,
        product?.details?.care
    );

    const materialCareInstructions = firstNonEmptyString(
        product?.materialCareInstructions,
        product?.materialCare,
        product?.careInstructions,
        product?.details?.materialCareInstructions
    );

    const instructionList = [
        ...normalizeToStringList(product?.careInstructions),
        ...normalizeToStringList(product?.careGuidePoints),
    ];

    return (
        <div className="w-full border-b border-gray-200">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
            >
                <h3 className="text-base font-semibold text-gray-900">Care Guide</h3>
                {expanded ? (
                    <ChevronUp size={20} className="text-gray-600" />
                ) : (
                    <ChevronDown size={20} className="text-gray-600" />
                )}
            </button>

            {expanded && (
                <div className="pb-4 text-sm text-gray-700 space-y-3">
                    {materialCareInstructions && (
                        <div>
                            <span className="font-semibold">Material Care Instructions: </span>
                            <span>{materialCareInstructions}</span>
                        </div>
                    )}

                    {careText && <p>{careText}</p>}

                    {instructionList.length > 0 && (
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                            {instructionList.map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                            ))}
                        </ul>
                    )}

                    {!materialCareInstructions && !careText && instructionList.length === 0 && <p>Care instructions not available.</p>}
                </div>
            )}
        </div>
    );
};

export default CareGuideSection;
