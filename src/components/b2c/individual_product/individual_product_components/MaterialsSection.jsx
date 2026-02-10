import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const MaterialsSection = ({ product }) => {
    const [expanded, setExpanded] = useState(false);

    const { fabric = "Not specified", composition } = product || {};
    const displayComposition = composition || fabric;

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
                    <div>
                        <span className="font-medium">Fabric: </span>
                        <span>{fabric}</span>
                    </div>
                    <div>
                        <span className="font-medium">Composition: </span>
                        <span>{displayComposition}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialsSection;
