import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const OrderDetails = ({ order = {}, onBack = () => { }, onDownloadInvoice = () => { } }) => {
  const [animateProgress, setAnimateProgress] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateProgress(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    let d;
    if (typeof date === "string") d = new Date(date);
    else if (date instanceof Date) d = date;
    else if (date.toDate && typeof date.toDate === "function") d = date.toDate();
    else d = new Date(date);

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatTime = (date) => {
    if (!date) return "";
    let d;
    if (typeof date === "string") d = new Date(date);
    else if (date instanceof Date) d = date;
    else if (date.toDate && typeof date.toDate === "function") d = date.toDate();
    else d = new Date(date);

    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const isReturn = order.status === "Returned" || order.status === "Return placed" || order.returnStatus;
  const isCancelled = order.status === "Cancelled";

  // Dynamic status steps
  const statusSteps = isReturn
    ? ["Return placed", "Pickup", "Shipped", "Refunded"]
    : isCancelled
      ? ["Order placed", "Pickup", "Shipped", "cancelled"]
      : ["Order placed", "In progress", "Shipped", "Delivered"];

  // Get current step index (0-based)
  const getCurrentStepIndex = () => {
    if (isReturn) {
      const returnStatus = order.returnStatus || order.status;
      switch (returnStatus) {
        case "Return placed":
        case "Return Placed":
        case "Returned": return 0;
        case "Pickup": return 1;
        case "Shipped": return 2;
        case "Return Shipped": return 2;
        case "Refunded": return 3;
        default: return 0;
      }
    }
    if (isCancelled) {
      // In the mockup for cancelled, "Order placed" is shown as the active step (idx 0)
      // but the header is red. Let's stick to this if it's newly cancelled.
      return 0;
    }
    switch (order.status) {
      case "Order placed":
      case "Order Placed": return 0;
      case "Active":
      case "In progress":
      case "In-progress": return 1;
      case "Shipped": return 2;
      case "Delivered": return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getCurrentStepIndex();
  const products = order.products && order.products.length > 0 ? order.products : [];
  const outfitFont = { fontFamily: "Outfit, sans-serif" };

  return (
    <div className="min-h-screen bg-white pb-20" style={outfitFont}>
      <div className="max-w-[1000px] mx-auto p-4 lg:p-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* ═══════════ HEADER BAR ═══════════ */}
        <div className="bg-[#F9F9F9] rounded-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <h2 className="font-bold text-[#1a1a1a]" style={{ fontSize: "16px" }}>
              Order no: #{order.orderId || order.id || "123456789"}
            </h2>
            <p className="text-gray-500" style={{ fontSize: "14px" }}>
              Placed On {formatDate(order.createdAt || order.date)} {formatTime(order.createdAt || order.date)}
            </p>
          </div>

          <div className="w-full md:w-auto flex justify-center">
            <button
              onClick={onDownloadInvoice}
              className="border border-[#33022F] text-[#33022F] font-bold px-8 py-2.5 rounded hover:bg-[#33022F] hover:text-white transition-all text-sm tracking-wide"
            >
              Download Invoice
            </button>
          </div>

          <div className="flex flex-col items-end w-full md:w-auto gap-1">
            <span className={`font-bold text-sm tracking-wide ${isCancelled ? 'text-red-500' : 'text-[#D87030]'}`}>
              {isCancelled ? 'ORDER CANCELLED' : (isReturn ? 'RETURN PLACED' : (order.status?.toUpperCase() || 'ACTIVE'))}
            </span>
            <div className="text-[#1a1a1a] font-bold" style={{ fontSize: "16px" }}>
              Total : ₹{(order.total || order.amount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* ═══════════ PROGRESS TRACKER ═══════════ */}
        <div className="mb-20 mt-10 px-4 md:px-10">
          <div className="relative">
            {/* Step Labels */}
            <div className="flex justify-between mb-2">
              {statusSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`text-center text-sm font-bold w-24 ${idx === currentStepIdx ? 'text-[#33022F]' : 'text-[#D1D1D1]'}`}
                  style={{ visibility: idx === currentStepIdx || idx > 0 ? 'visible' : 'visible' }}
                >
                  {step}
                </div>
              ))}
            </div>

            {/* Step Dots */}
            <div className="flex justify-between items-center relative mb-4">
              {statusSteps.map((_, idx) => (
                <div key={idx} className="flex flex-col items-center z-10">
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-500 ${idx <= currentStepIdx ? 'bg-[#1a1a1a]' : 'bg-[#D1D1D1]'}`}
                  />
                </div>
              ))}
            </div>

            {/* Connecting Segments */}
            <div className="flex justify-between gap-2 px-2">
              {statusSteps.map((_, idx) => {
                if (idx === statusSteps.length) return null;
                // Segment logic: each step has a segment below it? No, in the image there are 4 segments matching the 4 steps.
                // Wait, image shows:
                // [Label] ... [Label] ... [Label] ... [Label]
                //   (dot)       (dot)       (dot)       (dot)
                // [Seg1]      [Seg2]      [Seg3]      [Seg4]
                // So segments are aligned with labels and dots.

                const isActive = idx === currentStepIdx;
                const isCompleted = idx < currentStepIdx;

                return (
                  <div key={idx} className="flex-1 h-2 bg-[#D1D1D1] rounded-full overflow-hidden relative">
                    {/* Dark Progress Bar inside segment */}
                    <div
                      className="absolute left-0 top-0 h-full bg-[#33022F] transition-all duration-1000 ease-out"
                      style={{
                        width: animateProgress ? (isCompleted ? '100%' : (isActive ? '50%' : '0%')) : '0%'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════ STATUS MESSAGE ═══════════ */}
        <div className="bg-[#F9F9F9] border border-[#E0E0E0] p-5 mb-10 text-sm">
          <p className="text-[#333333] leading-relaxed">
            <span className="font-medium mr-1">{formatDate(order.createdAt || order.date)}, {formatTime(order.createdAt || order.date)}</span>
            <span className="font-bold">Your order has been successfully {isCancelled ? 'Cancelled' : (isReturn ? 'Returned' : 'Placed')}.</span>
          </p>
        </div>

        {/* ═══════════ PRODUCT LIST ═══════════ */}
        <div className="bg-[#F9F9F9] rounded-sm p-6 flex flex-col gap-8">
          {products.map((product, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Product Image */}
                <div className="w-24 h-32 bg-gray-200 shrink-0">
                  <img
                    src={product.image || product.imageUrls?.[0] || "/api/placeholder/96/128"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-black uppercase tracking-wide" style={{ fontSize: "15px" }}>
                      {product.brand || "SURBHI SHAH"}
                    </h3>
                    <div className="font-bold text-[#1a1a1a]" style={{ fontSize: "16px" }}>
                      ₹{(product.price || 0).toLocaleString()}
                    </div>
                  </div>

                  <p className="text-[#333333] mb-4" style={{ fontSize: "14px" }}>
                    {product.name || "mustard spun silk anarkali set"}
                  </p>

                  <div className="flex gap-6 mb-4">
                    <div className="text-xs font-bold text-black uppercase">
                      Size : <span className="ml-1">{product.size || "S"}</span>
                    </div>
                    <div className="text-xs font-bold text-black uppercase">
                      Qty : <span className="ml-1">{product.quantity || 1}</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-transparent">
                    ESTIMATED SHIPPING DATE : <span className="ml-1">{product.shippingDate || "4TH OF NOVEMBER"}</span>
                  </div>
                </div>
              </div>
              {idx < products.length - 1 && <div className="border-t border-gray-300 w-full" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
