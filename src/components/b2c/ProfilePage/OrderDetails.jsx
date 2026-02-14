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
    if (typeof date === "string") return date;
    if (date instanceof Date) {
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    }
    if (date.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    }
    return String(date);
  };

  const formatTime = (date) => {
    if (!date) return "";
    if (date instanceof Date) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    if (date.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return "";
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "Active": return "text-orange-600";
      case "Delivered": return "text-green-600";
      case "Cancelled": return "text-red-600";
      case "Returned": return "text-[#33022F]";
      default: return "text-gray-600";
    }
  };

  // Dynamic status steps based on order type
  const isReturn = order.status === "Returned" || order.returnStatus;
  const statusSteps = isReturn
    ? ["Return placed", "Pickup", "Shipped", "Refunded"]
    : ["Order Placed", "In-progress", "Shipped", "Delivered"];

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
    switch (order.status) {
      case "Active": return 1; // Assuming 'Active' implies In-progress
      case "Order Placed": return 0;
      case "In-progress": return 1;
      case "Shipped": return 2;
      case "Delivered": return 3;
      default: return 0;
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  // Status message
  const getStatusMessage = () => {
    const dateStr = formatDate(order.createdAt || order.date);
    const timeStr = formatTime(order.createdAt || order.date);
    if (order.status === "Cancelled") return `Order cancelled on ${dateStr}, ${timeStr}`;
    if (order.status === "Delivered") return `${dateStr}, ${timeStr} Your order has been successfully delivered.`;
    return `${dateStr}, ${timeStr} Your order has been successfully Placed.`;
  };

  // Status label for header
  const getStatusLabel = () => {
    if (isReturn) return "RETURN PLACED";
    switch (order.status) {
      case "Active": return "ORDER PLACED";
      case "Shipped": return "SHIPPED";
      case "Delivered": return "DELIVERED";
      case "Cancelled": return "CANCELLED";
      default: return order.status?.toUpperCase() || "ACTIVE";
    }
  };

  const products = order.products && order.products.length > 0 ? order.products : [];

  // Shared font style
  const outfitFont = { fontFamily: "Outfit, sans-serif" };

  return (
    <div className="min-h-screen bg-white" style={outfitFont}>
      <div className="max-w-[856px] mx-auto p-4 lg:p-8">
        {/* Back */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium" style={outfitFont}>Back</span>
          </button>
        </div>

        {/* ═══════════ HEADER BAR ═══════════ */}
        <div
          className="bg-gray-50 rounded-md border border-gray-200 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center"
          style={{ padding: "22.15px", paddingTop: "25.85px" }}
        >
          <div className="flex gap-4 items-center flex-wrap">
            <div>
              <h2
                className="font-semibold text-gray-800"
                style={{ ...outfitFont, fontSize: "14px", lineHeight: "1.4" }}
              >
                Order no: #{order.orderId || order.id || "123456789"}
              </h2>
              <p
                className="text-gray-600 mt-1"
                style={{ ...outfitFont, fontSize: "12px" }}
              >
                {order.status === "Cancelled"
                  ? `Cancelled On ${formatDate(order.createdAt || order.date)} ${formatTime(order.createdAt || order.date)}`
                  : `Placed On ${formatDate(order.createdAt || order.date)} ${formatTime(order.createdAt || order.date)}`}
              </p>
            </div>

            <button
              onClick={onDownloadInvoice}
              className="hover:bg-[#600000] text-sm border border-[#33022F] text-[#33022F] cursor-pointer hover:text-white font-medium flex items-center transition-colors"
              style={{ ...outfitFont, padding: "8px 16px", fontSize: "13px" }}
            >
              Download Invoice
            </button>
          </div>

          <div className="flex items-center gap-4 mt-3 sm:mt-0">
            <div className="text-right">
              <span
                className={`inline-block font-bold uppercase tracking-wider ${getStatusColorClass(order.status)}`}
                style={{ ...outfitFont, fontSize: "13px" }}
              >
                {getStatusLabel()}
              </span>
              <div
                className="text-gray-700 mt-1"
                style={{ ...outfitFont, fontSize: "13px" }}
              >
                Total : ₹{(order.amount || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ PROGRESS TRACKER ═══════════ */}
        {order.status !== "Cancelled" && (
          <div className="mb-12 px-2 sm:px-6 py-6">
            <div className="relative">
              {/* Flex container for the entire tracker */}
              <div className="flex items-center justify-between w-full relative z-10">
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  const isCompleted = index < currentStepIndex;

                  return (
                    <React.Fragment key={step}>
                      {/* STEP DOT & LABEL */}
                      <div className="flex flex-col items-center relative group" style={{ width: 'min-content' }}>

                        {/* Dot */}
                        <div
                          style={{
                            width: isActive ? "20px" : "16px",
                            height: isActive ? "20px" : "16px",
                            borderRadius: "50%",
                            backgroundColor: isActive ? "#1a1a1a" : "#D9D9D9",
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            transform: animateProgress && isActive ? "scale(1)" : (isActive ? "scale(0.8)" : "scale(1)"),
                            zIndex: 2,
                            border: isActive ? "2px solid white" : "none",
                            boxShadow: isActive ? "0 0 0 2px #1a1a1a" : "none"
                          }}
                        />

                        {/* Label */}
                        <div
                          className="absolute top-8 text-center w-32 -left-1/2 translate-x-[20%]"
                          style={{
                            ...outfitFont,
                            fontSize: "13px",
                            fontWeight: isActive ? 700 : 400,
                            color: isActive ? "#33022F" : "#C0C0C0",
                            transition: "color 0.4s ease",
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {step}
                        </div>
                      </div>

                      {/* CONNECTING BAR (Not after the last step) */}
                      {index < statusSteps.length - 1 && (
                        <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full relative overflow-hidden">
                          <div
                            className="h-full bg-[#33022F] rounded-full"
                            style={{
                              width: animateProgress && index < currentStepIndex ? "100%" : "0%",
                              transition: `width 0.8s ease-in-out ${index * 0.4}s`
                            }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STATUS MESSAGE ═══════════ */}
        <div
          className="bg-gray-50 text-gray-700 border border-gray-200 mb-8 mt-12"
          style={{
            ...outfitFont,
            fontSize: "13px",
            padding: "14px 20px",
            lineHeight: "1.6",
          }}
        >
          <span style={{ color: "#33022F", fontWeight: 500 }}>
            {formatDate(order.createdAt || order.date)}, {formatTime(order.createdAt || order.date)}
          </span>{" "}
          <span style={{ fontWeight: 700, color: "#1a1a1a" }}>
            {order.status === "Cancelled"
              ? "Your order has been cancelled."
              : order.status === "Delivered"
                ? "Your order has been successfully delivered."
                : "Your order has been successfully Placed."}
          </span>
        </div>

        {/* ═══════════ SHIPMENT DETAILS ═══════════ */}
        {order.awbCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-5 mb-8">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2" style={outfitFont}>
                🚚 Shipment Details
                {order.isTestOrder && <span className="bg-yellow-200 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full">TEST MODE</span>}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase" style={outfitFont}>Courier Partner</p>
                <p className="font-medium text-gray-900" style={outfitFont}>{order.courierName || "Standard Shipping"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase" style={outfitFont}>AWB Number</p>
                <p className="font-medium text-gray-900 tracking-wide" style={outfitFont}>{order.awbCode}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase" style={outfitFont}>Current Status</p>
                <p className="font-medium text-gray-900" style={outfitFont}>{order.shipmentStatus || "Booked"}</p>
              </div>
              <div className="flex items-center">
                {order.trackingUrl ? (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 text-xs font-semibold uppercase tracking-wider transition-colors"
                    style={outfitFont}
                  >
                    Track Shipment
                  </a>
                ) : (
                  <span className="text-gray-400 text-xs italic" style={outfitFont}>Tracking pending</span>
                )}
              </div>
            </div>
            {order.estimatedDelivery && (
              <div className="mt-3 pt-3 border-t border-blue-100 text-xs text-blue-700" style={outfitFont}>
                Estimated Delivery: <span className="font-medium">{order.estimatedDelivery}</span>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ PRODUCT LIST ═══════════ */}
        <div
          className="bg-[#F9F9F9] rounded-md divide-y divide-gray-200 mb-12"
          style={{ padding: "12px" }}
        >
          {products.length > 0 ? (
            products.map((product, i) => (
              <div
                key={product.id || i}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
                style={{ padding: "16px 12px", gap: "12px" }}
              >
                <div className="flex items-start" style={{ gap: "16px" }}>
                  <img
                    src={product.image || "/api/placeholder/80/100"}
                    alt={product.name}
                    className="object-cover flex-shrink-0 rounded"
                    style={{ width: "68px", height: "68px" }}
                  />
                  <div>
                    <h3
                      className="text-gray-900 uppercase"
                      style={{
                        ...outfitFont,
                        fontWeight: 700,
                        fontSize: "14px",
                        lineHeight: "1.3",
                      }}
                    >
                      {product.name || "Product Name"}
                    </h3>
                    <p
                      className="text-gray-600 mt-0.5"
                      style={{ ...outfitFont, fontSize: "12px", lineHeight: "1.4" }}
                    >
                      {product.description || product.desc || ""}
                    </p>
                    <p
                      className="text-gray-700 mt-2"
                      style={{ ...outfitFont, fontSize: "12px" }}
                    >
                      <span style={{ fontWeight: 600 }}>Size :</span>{" "}
                      {product.size || "N/A"}
                      <span className="ml-6" style={{ fontWeight: 600 }}>
                        Qty :
                      </span>{" "}
                      {product.quantity || 1}
                    </p>
                    <p
                      className="text-gray-900 mt-2 uppercase"
                      style={{
                        ...outfitFont,
                        fontWeight: 600,
                        fontSize: "10px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      ESTIMATED SHIPPING DATE : {product.shippingDate || "4TH OF NOVEMBER"}
                    </p>
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 text-right flex-shrink-0">
                  <p
                    className="text-gray-900"
                    style={{
                      ...outfitFont,
                      fontWeight: 700,
                      fontSize: "18px",
                    }}
                  >
                    ₹{((product.price || 0) * (product.quantity || 1)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500" style={outfitFont}>
              No products in this order
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
