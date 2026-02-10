import React from "react";
import { MapPin } from "lucide-react";

const FindInStoreSection = () => {
    return (
        <div className="w-full flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Find in store</span>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors">
                Check availability
            </button>
        </div>
    );
};

export default FindInStoreSection;
