import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const DeliveryReturnsSection = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="w-full border-b border-gray-200">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
            >
                <h3 className="text-base font-semibold text-gray-900">Delivery, Payment & Returns</h3>
                {expanded ? (
                    <ChevronUp size={20} className="text-gray-600" />
                ) : (
                    <ChevronDown size={20} className="text-gray-600" />
                )}
            </button>

            {expanded && (
                <div className="pb-4 text-sm text-gray-700 space-y-3">
                    <div>
                        <h4 className="font-semibold mb-1">Delivery</h4>
                        <p>Free standard delivery on orders over ₹5,000</p>
                        <p>Express delivery available at checkout</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-1">Payment</h4>
                        <p>We accept all major credit cards, debit cards, UPI, and net banking</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-1">Returns</h4>
                        <p>30-day return policy for all items</p>
                        <p>Items must be unworn and in original condition</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryReturnsSection;
