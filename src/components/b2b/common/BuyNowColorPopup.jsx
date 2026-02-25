import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Minus, Trash2 } from "lucide-react";
// Removed unused wishlistService import for cleaner code
// import { wishlistService } from "../../../services/wishlistService";

const BuyNowColorsPopup = ({ product, onClose, editingItem = null, userRole, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  /**
   * Extract Colors
   */
  const rawColors = product?.selectedColors || [];
  const extractedColors = rawColors
    .map((c) => {
      if (!c) return null;
      if (c.includes("_")) return c.split("_")[1];
      if (c.startsWith("#")) return c;
      return null;
    })
    .filter(Boolean);
  const colors = extractedColors.length > 0 ? extractedColors : ["#000000"];

  /**
   * Saree Check
   */
  const isSaree = product?.dressType?.toLowerCase() === "saree";

  /** Extract sizes based on selected color */
  const getAvailableSizesForColor = (color) => {
    const units = product?.units || {};

    // Find the color key in units (e.g., "red_#8B0000")
    const colorKey = rawColors.find((c) => c.includes(color) || c === color);

    if (colorKey && units[colorKey]) {
      return Object.keys(units[colorKey]).filter(
        (size) => !size.includes("_") && !size.includes("#")
      );
    }
    // Fallback for products where color is not the primary unit key
    return Object.keys(units).filter((key) => !key.includes("_") && !key.includes("#"));
  };

  /** UI States */
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(6);

  /** Update available sizes when color changes */
  useEffect(() => {
    if (!isSaree) {
      const sizes = getAvailableSizesForColor(selectedColor);
      setAvailableSizes(sizes);
      // Auto-select the first size, or keep current if available
      setSelectedSize(
        sizes.includes(selectedSize) ? selectedSize : sizes.length > 0 ? sizes[0] : ""
      );
    } else {
      // For sarees, set the available sizes to empty and selected size to 'FREE'
      setAvailableSizes([]);
      setSelectedSize("FREE");
    }
  }, [selectedColor, isSaree, selectedSize]);

  /** Get available quantity for selected color and size */
  const getAvailableQuantity = () => {
    if (isSaree) return 999; // Large number for sarees

    const units = product?.units || {};
    const colorKey = rawColors.find((c) => c.includes(selectedColor) || c === selectedColor); // Used selectedColor here too

    if (colorKey && units[colorKey] && selectedSize) {
      return parseInt(units[colorKey][selectedSize]) || 0;
    }

    // Fallback to general quantity (less reliable, but for completeness)
    return parseInt(units[selectedSize]) || 0;
  };

  /** Bulk Added Items Array - Pre-populate if editing */
  const [addedItems, setAddedItems] = useState(editingItem?.variants || []);

  const availableQuantity = getAvailableQuantity();

  const increment = () => {
    if (quantity < availableQuantity) {
      setQuantity((q) => q + 1);
    }
  };

  // Minimum quantity is 6
  const decrement = () => setQuantity((q) => (q > 6 ? q - 1 : 6));

  /** Add Current Selection to List */
  const handleAdd = () => {
    if (quantity < 6) {
      alert(`Minimum quantity required is 6 units for B2B orders`);
      return;
    }

    if (quantity > availableQuantity) {
      alert(`Only ${availableQuantity} units available for this combination`);
      return;
    }

    const newEntry = {
      color: selectedColor,
      size: isSaree ? "FREE" : selectedSize,
      quantity: quantity,
      availableQuantity: availableQuantity,
    };

    /** Check if this exact color/size combination already exists */
    const existingItemIndex = addedItems.findIndex(
      (item) => item.color === newEntry.color && item.size === newEntry.size
    );

    if (existingItemIndex !== -1) {
      /** Update quantity if combination exists */
      const updatedItems = [...addedItems];
      const newTotalQuantity = updatedItems[existingItemIndex].quantity + newEntry.quantity;

      if (newTotalQuantity > availableQuantity) {
        alert(`Cannot exceed available quantity of ${availableQuantity} units`);
        return;
      }

      updatedItems[existingItemIndex].quantity = newTotalQuantity;
      setAddedItems(updatedItems);
    } else {
      /** Add new entry if combination doesn't exist */
      setAddedItems((prev) => [...prev, newEntry]);
    }
    setQuantity(6);
  };

  /** Check if current selection is already in added items (for button disabling) */
  const isCurrentSelectionAdded = addedItems.some(
    (item) => item.color === selectedColor && item.size === (isSaree ? "FREE" : selectedSize)
  );

  /** Delete individual item from added items */
  const handleDeleteItem = (index) => {
    setAddedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  /** Update quantity of existing item */
  const handleUpdateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 6) {
      alert("Minimum order quantity is 6 units for B2B.");
      return;
    }

    const item = addedItems[index];
    const itemAvailableQty = item.availableQuantity || 999;

    if (newQuantity > itemAvailableQty) {
      alert(`Cannot exceed available quantity of ${itemAvailableQty} units`);
      return;
    }

    setAddedItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantity: newQuantity } : item))
    );
  };

  /**
   * Handle Continue Button - Add to cart and navigate
   */
  const handleContinue = async () => {
    console.log("🟦 handleContinue() called for Buy Now");

    const totalQuantity = addedItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity < 6) {
      alert("Minimum order quantity for B2B is 6 units");
      return;
    }

    setLoading(true);

    try {
      if (onConfirm) {
        await onConfirm(addedItems);

        const totalItems = addedItems.reduce((sum, item) => sum + item.quantity, 0);
        alert(`✅ ${totalItems} items added to cart for checkout!`);
      }
    } catch (err) {
      console.error("❌ Error in B2B Buy Now:", err);
      alert("Failed to process Buy Now order. Please try again.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  /** Calculate total items in cart */
  const totalItems = addedItems.reduce((sum, item) => sum + item.quantity, 0);

  /** Prevent background scrolling when modal is open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return createPortal(
    <div className="b2b-modal-portal relative z-[9999]">
      {/* Loading Spinner - remains the same */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-[9999]">
          <div
            className="border-t-4 border-b-4 border-gray-200 rounded-full animate-spin"
            style={{
              width: "4rem",
              height: "4rem",
              borderTopColor: "#800000",
              borderBottomColor: "#800000",
            }}
          ></div>
        </div>
      )}

      {/* Background Overlay - Covers full viewport securely */}
      <div className="fixed inset-0 bg-black/5 z-[9990]">
        {/* Click-away overlay to close modal */}
        <div className="absolute inset-0" onClick={onClose}></div>

        {/* Modal Content Box - Fixed and Perfectly Centered */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[850px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col md:flex-row z-[9995] border border-gray-100">

          {/* Main Selection Panel (Left) */}
          <div className="flex-[1.2] p-8 md:border-r border-gray-100">
            {/* Color Selection */}
            <div>
              <p className="text-[11px] font-medium tracking-wider text-gray-800 mb-3">
                AVAILABLE COLORS
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((hex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(hex)}
                    className={`w-10 h-10 border transition-all ${selectedColor === hex ? "border-black p-0.5" : "border-gray-200"
                      }`}
                  >
                    <div className="w-full h-full" style={{ backgroundColor: hex }}></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection (Hidden for Saree) */}
            {!isSaree && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[11px] font-medium tracking-wider text-gray-800">
                    AVAILABLE SIZES
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Select your size <span className="text-red-500 ml-1 cursor-pointer hover:underline">Size Guide</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-10 flex items-center justify-center text-[11px] font-medium border transition-colors ${selectedSize === size
                        ? "bg-[#33022F] text-white border-[#33022F]"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Available Quantity Display */}
                {selectedSize && (
                  <div className="mt-2 text-[10px] text-gray-500">
                    Available: {availableQuantity} units
                  </div>
                )}
              </div>
            )}

            {/* Current Selection & Quantity Row */}
            <div className="mt-8 flex justify-between items-start">
              <div className="flex-[1.5]">
                <p className="text-[11px] font-medium tracking-wider text-gray-800 mb-3">
                  CURRENT SELECTION
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-gray-200" style={{ backgroundColor: selectedColor }}></div>
                    <span>Size: {isSaree ? "FREE" : selectedSize || "-"}</span>
                  </div>
                  <div>
                    <span>Quantity: {quantity < 10 ? `0${quantity}` : quantity}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium tracking-wider text-gray-800 mb-3">
                  QUANTITY
                </p>
                <div className="flex items-center border border-gray-300 h-10 w-28">
                  <button
                    onClick={decrement}
                    className="flex-1 flex justify-center items-center h-full text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="w-10 text-center text-xs font-semibold text-gray-800">
                    {quantity < 10 ? `0${quantity}` : quantity}
                  </div>
                  <button
                    onClick={increment}
                    disabled={quantity >= availableQuantity}
                    className={`flex-1 flex justify-center items-center h-full transition-colors ${quantity >= availableQuantity
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                      }`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAdd}
              disabled={
                isCurrentSelectionAdded ||
                quantity > availableQuantity ||
                (!isSaree && !selectedSize)
              }
              className={`w-full mt-8 py-3.5 border border-[#33022F] text-[13px] font-bold tracking-widest transition-colors ${isCurrentSelectionAdded || quantity > availableQuantity || (!isSaree && !selectedSize)
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-[#33022F] hover:bg-gray-50 cursor-pointer"
                }`}
            >
              {isCurrentSelectionAdded
                ? "ALREADY ADDED"
                : quantity > availableQuantity
                  ? "EXCEEDS STOCK"
                  : !isSaree && !selectedSize
                    ? "SELECT SIZE"
                    : "ADD"}
            </button>
          </div>

          {/* Added Items Panel (Right) */}
          <div className="flex-[0.8] p-8 flex flex-col bg-white">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800 text-[13px] tracking-wide">ADDED ITEMS</p>
              {/* Close Button X moved here or top right wrapper */}
              <button
                className="text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
                onClick={onClose}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {addedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                  <Plus size={24} />
                </div>
                <p className="text-[13px] text-[#2D2D7D] font-medium">No items added yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                {addedItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-md bg-white relative group shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <div className="w-20 h-24 border border-gray-200 bg-gray-50 rounded-sm overflow-hidden flex-shrink-0">
                      <img
                        src={product?.imageUrls?.[0] || "/placeholder.jpg"}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <p className="text-[13px] font-bold text-gray-800 mb-1 flex items-center gap-2">
                        Color: <span className="font-medium text-gray-600">{item.color}</span>
                        <div className="w-3 h-3 rounded-full border border-gray-300 ml-1" style={{ backgroundColor: item.color }}></div>
                      </p>
                      <p className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                        Size: <span className="font-medium text-gray-600">{item.size}</span>
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="text-[13px] font-bold text-gray-800">Qty:</p>
                        <div className="flex items-center border border-gray-200 bg-white h-8 rounded-sm overflow-hidden">
                          <button onClick={() => handleUpdateItemQuantity(idx, item.quantity - 1)} disabled={item.quantity <= 6} className="w-8 flex justify-center items-center text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"><Minus size={14} /></button>
                          <span className="w-10 flex items-center justify-center text-[13px] font-bold text-gray-800 border-x border-gray-200 h-full">{item.quantity}</span>
                          <button onClick={() => handleUpdateItemQuantity(idx, item.quantity + 1)} disabled={item.quantity >= (item.availableQuantity || 999)} className="w-8 flex justify-center items-center text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteItem(idx)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Continue Button */}
            {addedItems.length > 0 && (
              <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-gray-500">Total variants: {addedItems.length}</span>
                  <span className="text-sm font-semibold text-gray-800">Total items: {totalItems}</span>
                </div>
                <button
                  onClick={handleContinue}
                  disabled={totalItems < 6}
                  className={`w-full py-3.5 text-[13px] font-bold tracking-widest transition-colors ${totalItems < 6 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#33022F] text-white hover:bg-[#4a0344] cursor-pointer"
                    }`}
                >
                  {editingItem ? "UPDATE CART" : `CONTINUE TO CHECKOUT`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BuyNowColorsPopup;
