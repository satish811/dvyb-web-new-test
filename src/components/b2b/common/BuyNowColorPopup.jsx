import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { wishlistService } from "../../../services/wishlistService";

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
            setSelectedSize(sizes.length > 0 ? sizes[0] : "");
        }
    }, [selectedColor, isSaree]);

    /** Get available quantity for selected color and size */
    const getAvailableQuantity = () => {
        if (isSaree) return 999; // Large number for sarees

        const units = product?.units || {};
        const colorKey = rawColors.find((c) => c.includes(selectedColor) || c === color);

        if (colorKey && units[colorKey] && selectedSize) {
            return parseInt(units[colorKey][selectedSize]) || 0;
        }

        // Fallback to general quantity
        return parseInt(units[selectedSize]) || 0;
    };

    /** Bulk Added Items Array - Pre-populate if editing */
    const [addedItems, setAddedItems] = useState(editingItem?.variants || []);

    const increment = () => {
        const availableQty = getAvailableQuantity();
        if (quantity < availableQty) {
            setQuantity((q) => q + 1);
        }
    };

    const decrement = () => setQuantity((q) => (q > 6 ? q - 1 : 6));

    /** Add Current Selection to List */
    const handleAdd = () => {
        const availableQty = getAvailableQuantity();

        if (quantity < 6) {
            alert(`Minimum quantity required is 6 units for B2B orders`);
            return;
        }

        if (quantity > availableQty) {
            alert(`Only ${availableQty} units available for this combination`);
            return;
        }

        const newEntry = {
            color: selectedColor,
            size: isSaree ? "FREE" : selectedSize,
            quantity: quantity,
            availableQuantity: availableQty,
        };

        /** Check if this exact color/size combination already exists */
        const existingItemIndex = addedItems.findIndex(
            (item) => item.color === newEntry.color && item.size === newEntry.size
        );

        if (existingItemIndex !== -1) {
            /**
             * Update quantity if combination exists
             */
            const updatedItems = [...addedItems];
            const newTotalQuantity = updatedItems[existingItemIndex].quantity + newEntry.quantity;

            if (newTotalQuantity > availableQty) {
                alert(`Cannot exceed available quantity of ${availableQty} units`);
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
        const availableQty = item.availableQuantity || 999;

        if (newQuantity > availableQty) {
            alert(`Cannot exceed available quantity of ${availableQty} units`);
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
            const productId = product?.id || product?.productId;
            const variants = addedItems.map((item) => ({
                color: item.color,
                size: item.size,
                quantity: item.quantity,
            }));

            console.log("🟡 Processing B2B Buy Now with variants:", variants);

            
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

    const availableQuantity = getAvailableQuantity();

    return (
        <>
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

            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[200] p-4 overflow-auto">
                <div className="bg-white w-full max-w-6xl shadow-xl flex flex-col md:flex-row relative">
                    <button
                        className="absolute top-3 right-3 text-gray-600 hover:text-black cursor-pointer z-10"
                        onClick={onClose}
                    >
                        <X size={22} />
                    </button>

                    <div className="flex-1 p-6">
                        <div>
                            <p className="text-[12px] font-semibold text-gray-900 mb-2">AVAILABLE COLORS</p>

                            <div className="flex flex-wrap gap-3">
                                {colors.map((hex, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedColor(hex)}
                                        className={`w-7 h-7 border-2 ${selectedColor === hex ? "border-black" : "border-transparent"
                                            }`}
                                        style={{ backgroundColor: hex }}
                                    />
                                ))}
                            </div>
                        </div>

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
                                            className={`px-4 py-2 text-[12px] border ${selectedSize === size
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
                        <div className="mt-6 flex flex-row justify-between">
                            <div className="flex items-center gap-5 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border" style={{ backgroundColor: selectedColor }}></div>
                                    {!isSaree && <span>Size: {selectedSize}</span>}
                                    {isSaree && <span>Size: FREE</span>}
                                </div>

                                <div>
                                    <span>Quantity: {quantity < 10 ? `0${quantity}` : quantity}</span>
                                </div>
                            </div>

                            <div className="">
                                <p className="text-xs font-semibold text-gray-900">QUANTITY</p>
                                <div className="flex items-center mt-2 border-2">
                                    <button
                                        onClick={decrement}
                                        className="text-amber-800 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <Minus size={14} />
                                    </button>

                                    <div className="px-5 py-1">{quantity < 10 ? `0${quantity}` : quantity}</div>

                                    <button
                                        onClick={increment}
                                        disabled={quantity >= availableQuantity}
                                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${quantity >= availableQuantity
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
                            disabled={isCurrentSelectionAdded || quantity > availableQuantity}
                            className={`w-full mt-8 py-3 border font-semibold tracking-wide transition ${isCurrentSelectionAdded || quantity > availableQuantity
                                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                                : "border-[#7a0000] text-[#7a0000] hover:bg-[#7a0000] hover:text-white cursor-pointer"
                                }`}
                        >
                            {isCurrentSelectionAdded
                                ? "ALREADY ADDED"
                                : quantity > availableQuantity
                                    ? "EXCEEDS STOCK"
                                    : "ADD TO LIST"}
                        </button>

                        {addedItems.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 rounded">
                                <p className="text-sm font-semibold">Total Items in List: {totalItems}</p>
                                <p className="text-xs text-gray-600">{addedItems.length} variant(s) added</p>
                            </div>
                        )}
                    </div>

                    <div
                        className="w-full md:w-80 p-6 flex flex-col m-9 border"
                        style={{ border: "1px solid #0000001A" }}
                    >
                        <p className="font-semibold text-[18px]">ADDED ITEMS</p>
                        <div className="w-full border-t border-b-blue-100 mt-3 mb-5"></div>

                        {addedItems.length === 0 ? (
                            <div className="flex flex-col items-center rounded-lg text-center text-gray-500 mt-10">
                                <Plus size={30} className="m-4 rounded-full border" />
                                No items added yet
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 max-h-50 overflow-y-auto scrollbar-hide pr-1">
                                {addedItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                                        className="flex items-center gap-3 px-3 py-2 relative group"
                                    >
                                        <div
                                            className="w-6 h-6 border rounded"
                                            style={{ backgroundColor: item.color }}
                                        ></div>

                                        <div className="flex text-sm flex-row gap-3 flex-1">
                                            <div>
                                                <span>Size:</span> {item.size}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Qty:</span>
                                                <button
                                                    onClick={() => handleUpdateItemQuantity(idx, item.quantity - 1)}
                                                    className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded"
                                                >
                                                    <Minus size={10} />
                                                </button>
                                                <span>{item.quantity < 10 ? `0${item.quantity}` : item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateItemQuantity(idx, item.quantity + 1)}
                                                    disabled={item.quantity >= (item.availableQuantity || 999)}
                                                    className={`w-5 h-5 flex items-center justify-center rounded ${item.quantity >= (item.availableQuantity || 999)
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-200"
                                                        }`}
                                                >
                                                    <Plus size={10} />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteItem(idx)}
                                            className="absolute top-1 right-1 p-1 hover:bg-red-100 rounded-full transition opacity-70 hover:opacity-100 cursor-pointer"
                                            title="Remove this item"
                                        >
                                            <Trash2 className="w-4 h-5 text-red-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {addedItems.length > 0 && (
                            <button
                                onClick={handleContinue}
                                className="mt-6 w-full py-3 cursor-pointer bg-[#7a0000] text-white font-semibold tracking-wide hover:bg-[#5a0000] transition"
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
