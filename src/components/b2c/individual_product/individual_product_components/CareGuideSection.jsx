import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CareGuideSection = ({ product }) => {
    const [expanded, setExpanded] = useState(false);

    const { care = "Dry clean only" } = product || {};

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
                <div className="pb-4 text-sm text-gray-700">
                    <p>{care}</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Do not wring</li>
                        <li>Do not bleach</li>
                        <li>Iron on low heat if needed</li>
                        <li>Store in a cool, dry place</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CareGuideSection;
