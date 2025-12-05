import React, { useState, useEffect } from "react";
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
            setSelectedSize(sizes.includes(selectedSize) ? selectedSize : (sizes.length > 0 ? sizes[0] : ""));
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


    return (
        <>
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

            {/* Modal Container: Adjusted for mobile */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[200] p-0 md:p-4 overflow-auto">
                {/* Modal Content Box */}
                <div className="bg-white w-full h-full max-w-full md:max-w-6xl md:h-auto shadow-xl flex flex-col relative">
                    <button
                        className="absolute top-3 right-3 text-gray-600 hover:text-black cursor-pointer z-10"
                        onClick={onClose}
                    >
                        <X size={22} />
                    </button>

                    {/* Main Selection Panel (Left on Desktop, Top on Mobile) */}
                    <div className="flex-1 p-6 order-2 md:order-1">
                        <h2 className="text-xl font-bold mb-4">Select Bulk Order Variants</h2>

                        {/* Color Selection */}
                        <div>
                            <p className="text-[12px] font-semibold text-gray-900 mb-2">AVAILABLE COLORS</p>

              <div className="flex flex-wrap gap-3">
                {colors.map((hex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(hex)}
                    className={`w-7 h-7 border-2 ${
                      selectedColor === hex ? "border-black" : "border-transparent"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

                        {/* Size Selection (Hidden for Saree) */}
                        {!isSaree && (
                            <div className="mt-6">
                                <p className="text-[12px] font-semibold text-gray-900 mb-2">
                                    AVAILABLE SIZES
                                    <span className="text-[#d20000] ml-2 cursor-pointer">Size Guide</span>
                                </p>

                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-[12px] border ${
                        selectedSize === size
                          ? "bg-[#7a0000] text-white border-[#7a0000]"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Available Quantity Display */}
                {selectedSize && (
                  <div className="mt-2 text-xs text-gray-600">
                    Available: {availableQuantity} units
                  </div>
                )}
              </div>
            )}

                        <p className="text-[12px] font-semibold text-gray-900 mt-5">CURRENT SELECTION</p>
                        <div className="mt-3 flex flex-col sm:flex-row justify-between sm:items-center border-t pt-3">
                            <div className="flex items-center gap-5 text-sm mb-4 sm:mb-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border" style={{ backgroundColor: selectedColor }}></div>
                                    <span>Size: {isSaree ? "FREE" : selectedSize}</span>
                                </div>

                                <div>
                                    <span>Qty: {quantity < 10 ? `0${quantity}` : quantity}</span>
                                </div>
                            </div>

                            <div className="">
                                <p className="text-xs font-semibold text-gray-900 hidden sm:block">QUANTITY</p>
                                <div className="flex items-center mt-0 sm:mt-2 border-2">
                                    <button
                                        onClick={decrement}
                                        className="text-amber-800 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <Minus size={14} />
                                    </button>

                                    {/* Using input for direct quantity editing might be better UX, but sticking to original logic here */}
                                    <div className="px-5 py-1 min-w-[40px] text-center">{quantity < 10 ? `0${quantity}` : quantity}</div>

                  <button
                    onClick={increment}
                    disabled={quantity >= availableQuantity}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                      quantity >= availableQuantity
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-amber-800"
                    }`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  Max: {availableQuantity}
                </div>
              </div>
            </div>

                        <button
                            onClick={handleAdd}
                            disabled={isCurrentSelectionAdded || quantity > availableQuantity || (!isSaree && !selectedSize)}
                            className={`w-full mt-6 py-3 border font-semibold tracking-wide transition text-sm ${isCurrentSelectionAdded || quantity > availableQuantity || (!isSaree && !selectedSize)
                                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                                : "border-[#7a0000] text-[#7a0000] hover:bg-[#7a0000] hover:text-white cursor-pointer"
                                }`}
                        >
                            {isCurrentSelectionAdded
                                ? "ALREADY ADDED"
                                : quantity > availableQuantity
                                    ? "EXCEEDS STOCK"
                                    : (!isSaree && !selectedSize)
                                        ? "SELECT SIZE"
                                        : "ADD TO LIST"}
                        </button>

                        {addedItems.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 rounded hidden sm:block"> {/* Hide on extra small screens */}
                                <p className="text-sm font-semibold">Total Items in List: {totalItems}</p>
                                <p className="text-xs text-gray-600">{addedItems.length} variant(s) added</p>
                            </div>
                        )}
                    </div>

                    {/* Added Items Panel (Right on Desktop, Bottom on Mobile) */}
                    {/* Note: Removed fixed width (w-80) for mobile to allow full width, 
                         and adjusted padding and margin for better fit. */}
                    <div
                        className="w-full p-6 flex flex-col order-1 md:order-2 md:w-100 border-b md:border-l md:border-b-0"
                        style={{ border: "1px solid #0000001A", borderTop: "1px solid #0000001A" }} // Ensure separation on mobile
                    >
                        <p className="font-semibold text-[18px]">ADDED ITEMS</p>


                        {addedItems.length === 0 ? (
                            <div className="flex flex-col items-center rounded-lg text-center text-gray-500 mt-5 mb-5 md:mt-10 md:mb-10 flex-1 justify-center">
                                <Plus size={30} className="m-4 rounded-full border" />
                                No items added yet
                            </div>
                        ) : (
                            // Scrollable list on mobile
                            <div className="flex flex-col gap-3 max-h-[30vh] md:max-h-[50vh] overflow-y-auto scrollbar-hide pr-1">
                                {addedItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                                        className="flex items-center gap-3 px-3 py-2 relative group"
                                    >
                                        <div
                                            className="w-5 h-5 border rounded" // Slightly smaller color swatch
                                            style={{ backgroundColor: item.color }}
                                        ></div>

                                        <div className="flex text-sm flex-row gap-2 flex-1 items-center">
                                            <div>
                                                <span className="font-medium">Size:</span> {item.size}
                                            </div>

                                            {/* Quantity controls inside the item list */}
                                            <div className="flex items-center gap-1 ml-auto">
                                                <span className="font-medium">Qty:</span>
                                                <button
                                                    onClick={() => handleUpdateItemQuantity(idx, item.quantity - 1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded" // Larger tap target
                                                    disabled={item.quantity <= 6}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="min-w-[20px] text-center">{item.quantity < 10 ? `0${item.quantity}` : item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateItemQuantity(idx, item.quantity + 1)}
                                                    disabled={item.quantity >= (item.availableQuantity || 999)}
                                                    className={`w-6 h-6 flex items-center justify-center rounded ${item.quantity >= (item.availableQuantity || 999)
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-200"
                                                        }`}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteItem(idx)}
                                            className="absolute top-1 right-1 p-1 hover:bg-red-100 rounded-full transition opacity-70 hover:opacity-100 cursor-pointer"
                                            title="Remove this item"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Summary for mobile when list is open */}
                        {addedItems.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 rounded sm:hidden">
                                <p className="text-sm font-semibold">Total Items in List: {totalItems}</p>
                                <p className="text-xs text-gray-600">{addedItems.length} variant(s) added</p>
                            </div>
                        )}

                        {/* Continue Button */}
                        {addedItems.length > 0 && (
                            <button
                                onClick={handleContinue}
                                // Ensure total order quantity is at least 6
                                disabled={totalItems < 6}
                                className={`mt-6 w-full py-3 cursor-pointer text-white font-semibold tracking-wide transition ${totalItems < 6 ? "bg-gray-400 cursor-not-allowed" : "bg-[#7a0000] hover:bg-[#5a0000]"}`}
                            >
                                {editingItem ? "UPDATE CART" : `CONTINUE (${totalItems} items)`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BuyNowColorsPopup;