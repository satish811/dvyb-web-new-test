import React from "react";

const ProductDetailsSection = ({ product }) => {
  if (!product) return null;

  // Extract product details with fallbacks
  const {
    note = "The saree worn by the model is for styling purposes only",
    fabric = "Not specified",
    craft = "Not specified",
    productType = "Not specified",
    dressType = "Not specified",
    composition = fabric,
    care = "Dry clean only",
    fit = "Fitted at bust",
  } = product;

  return (
    <div className="w-full bg-grey-50 border-t border-gray-200 pt-6 mt-6">
      {/* Product details in grid */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 text-sm">
        {/* FABRIC */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
            FABRIC
          </h4>
          <p className="text-gray-700">{fabric}</p>
        </div>

        {/* CRAFT */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
            CRAFT
          </h4>
          <p className="text-gray-700">{craft}</p>
        </div>

        {/* PRODUCT TYPE */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
            PRODUCT TYPE
          </h4>
          <p className="text-gray-700">{productType}</p>
        </div>

        {/* DRESS TYPE */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
            DRESS TYPE
          </h4>
          <p className="text-gray-700">{dressType}</p>
        </div>

        {/* COMPOSITION */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
            COMPOSITION
          </h4>
          <p className="text-gray-700">{composition}</p>
        </div>

        {/* CARE */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">CARE</h4>
          <p className="text-gray-700">{care}</p>
        </div>

        {/* FIT */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">FIT</h4>
          <p className="text-gray-700">{fit}</p>
        </div>

        {/* BOUTIQUE PRODUCT LABEL */}
        {product.boutique && (
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">LABEL</h4>
            <p className="text-gray-700 font-medium text-[#800000]">Boutique Product</p>
          </div>
        )}
      </div>

      {/* NOTE - Full width */}
      <div className="mt-6">
        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">NOTE</h4>
        <p className="text-gray-700">{note}</p>
      </div>

      {/* ADDITIONAL DETAILS - Full width (Optional) */}
      {product?.additionalDetails && (
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
            ADDITIONAL DETAILS
          </h4>
          <p className="text-gray-700 whitespace-pre-wrap">{product.additionalDetails}</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsSection;
