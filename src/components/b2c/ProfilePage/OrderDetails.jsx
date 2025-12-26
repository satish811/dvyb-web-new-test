import React from "react";
import { ArrowLeft } from "lucide-react";

const OrderDetails = ({ order = {}, onBack = () => {}, onDownloadInvoice = () => {} }) => {
  // Format date dynamically
  const formatDate = (date) => {
    if (!date) return "N/A";

    if (typeof date === "string") return date;

    if (date instanceof Date) {
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    if (date.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    return String(date);
  };

  const formatTime = (date) => {
    if (!date) return "";

    if (date instanceof Date) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (date.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return "";
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "Active":
        return "text-orange-600";
      case "Delivered":
        return "text-green-600";
      case "Cancelled":
        return "text-red-600";
      case "Returned":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Dynamic status message
  const getStatusMessage = () => {
    const dateStr = formatDate(order.createdAt || order.date);
    const timeStr = formatTime(order.createdAt || order.date);

    if (order.status === "Cancelled") {
      return `Order cancelled on ${dateStr}, ${timeStr}`;
    }
    if (order.status === "Delivered") {
      return `${dateStr}, ${timeStr} — Your order has been successfully delivered.`;
    }
    return `${dateStr}, ${timeStr} — Your order has been successfully placed.`;
  };

  // Use actual products from order
  const products = order.products && order.products.length > 0 ? order.products : [];

  return (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* HEADER BAR */}
        <div className="bg-gray-50 rounded-md p-5 mb-8 border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Order no: #{order.orderId || order.id || "123456789"}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {order.status === "Cancelled"
                  ? `Cancelled On: ${formatDate(order.createdAt || order.date)}, ${formatTime(order.createdAt || order.date)}`
                  : `Placed On: ${formatDate(order.createdAt || order.date)}, ${formatTime(order.createdAt || order.date)}`}
              </p>
            </div>

            <button
              onClick={onDownloadInvoice}
              className="hover:bg-hoverBg text-sm p-2 border border-primary text-primary cursor-pointer hover:text-white font-medium flex items-center"
            >
              Download Invoice
            </button>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <span
                className={`inline-block text-sm font-semibold px-3 py-1 rounded ${getStatusColorClass(
                  order.status
                )}`}
              >
                {order.status || "Active"}
              </span>
              <div className="text-sm text-gray-700 mt-1">
                Total : ₹{(order.amount || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* SHIPMENT DETAILS */}
        {order.awbCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-5 mb-8">
             <div className="flex justify-between items-start mb-3">
               <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                 🚚 Shipment Details 
                 {order.isTestOrder && <span className="bg-yellow-200 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full">TEST MODE</span>}
               </h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase">Courier Partner</p>
                  <p className="font-medium text-gray-900">{order.courierName || "Standard Shipping"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase">AWB Number</p>
                  <p className="font-medium text-gray-900 tracking-wide">{order.awbCode}</p>
                </div>
                <div>
                   <p className="text-gray-500 text-xs uppercase">Current Status</p>
                   <p className="font-medium text-gray-900">{order.shipmentStatus || "Booked"}</p>
                </div>
                <div className="flex items-center">
                   {order.trackingUrl ? (
                     <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 text-xs font-semibold uppercase tracking-wider transition-colors">
                        Track Shipment
                     </a>
                   ) : (
                     <span className="text-gray-400 text-xs italic">Tracking pending</span>
                   )}
                </div>
             </div>
             {order.estimatedDelivery && (
                <div className="mt-3 pt-3 border-t border-blue-100 text-xs text-blue-700">
                  Estimated Delivery: <span className="font-medium">{order.estimatedDelivery}</span>
                </div>
             )}
          </div>
        )}

        {/* PROGRESS TRACKER */}
        {order.status !== "Cancelled" && (
          <div className="px-6 py-8 bg-white mb-6">
            <div className="relative max-w-2xl mx-auto">
              {/* Background Line */}
              <div
                className="absolute top-3 left-0 right-0 h-[4px] bg-[#F0E0E0]"
                style={{ marginLeft: "12px", marginRight: "12px" }}
              ></div>

              {/* Active Progress Line */}
              <div
                className="absolute top-3 left-0 h-[4px] bg-[#8B0000] transition-all duration-500"
                style={{
                  marginLeft: "12px",
                  width:
                    order.status === "Delivered"
                      ? "calc(100% - 24px)"
                      : order.status === "Shipped"
                        ? "calc(66.66% - 24px)"
                        : order.status === "Active"
                          ? "calc(33.33% - 24px)"
                          : "0%",
                }}
              ></div>

              {/* Progress Steps */}
              <div className="relative flex justify-between">
                {/* Order Placed */}
                <div className="flex flex-col items-center" style={{ width: "80px" }}>
                  <div className="w-6 h-6 -ml-8 rounded-full bg-[#8B0000] flex items-center justify-center mb-3 relative z-10">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-900 text-center">Order Placed</p>
                </div>

                {/* In-progress */}
                <div className="flex flex-col items-center" style={{ width: "80px" }}>
                  <div
                    className={`w-6 h-6 -ml-8 rounded-full flex items-center justify-center mb-3 relative z-10 ${
                      order.status === "Active" ||
                      order.status === "Shipped" ||
                      order.status === "Delivered"
                        ? "bg-[#8B0000]"
                        : "bg-[#F0E0E0]"
                    }`}
                  >
                    {order.status === "Active" ||
                    order.status === "Shipped" ||
                    order.status === "Delivered" ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : null}
                  </div>
                  <p
                    className={`text-xs font-medium text-center ${
                      order.status === "Active" ||
                      order.status === "Shipped" ||
                      order.status === "Delivered"
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    In-progress
                  </p>
                </div>

                {/* Shipped */}
                <div className="flex flex-col items-center" style={{ width: "80px" }}>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center mb-3 mt-1 relative z-10 ${
                      order.status === "Shipped" || order.status === "Delivered"
                        ? "bg-[#8B0000]"
                        : "bg-[#F0E0E0]"
                    }`}
                  >
                    {order.status === "Shipped" || order.status === "Delivered" ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : null}
                  </div>
                  <p
                    className={`text-xs font-medium text-center ${
                      order.status === "Shipped" || order.status === "Delivered"
                        ? "text-gray-900"
                        : "text-[#F0E0E0]"
                    }`}
                  >
                    Shipped
                  </p>
                </div>

                {/* Delivered */}
                <div className="flex flex-col items-center" style={{ width: "80px" }}>
                  <div
                    className={`w-5 h-5 mt-1 rounded-full flex ml-10 items-center justify-center mb-3 relative z-10 ${
                      order.status === "Delivered" ? "bg-[#8B0000]" : "bg-[#F0E0E0]"
                    }`}
                  >
                    {order.status === "Delivered" ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : null}
                  </div>
                  <p
                    className={`text-xs font-medium ml-9 text-center ${
                      order.status === "Delivered" ? "text-gray-900" : "text-[#F0E0E0]"
                    }`}
                  >
                    Delivered
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATUS MESSAGE */}
        <div className="bg-gray-50 text-sm md:w-[510px] text-gray-700 border border-gray-200 px-4 py-3 mb-8">
          {getStatusMessage()}
        </div>

        {/* PRODUCT LIST */}
        <div className="bg-[#F6F6F6] p-3 divide-y divide-gray-200 mb-12">
          {products.length > 0 ? (
            products.map((product, i) => (
              <div
                key={product.id || i}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4"
              >
                <div className="flex items-start">
                  <img
                    src={product.image || "/api/placeholder/80/80"}
                    alt={product.name}
                    className="w-20 h-20 object-cover mr-4 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {product.name || "Product Name"}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {product.description || product.desc || "Product description"}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium mt-4">Size:</span> {product.size || "N/A"}{" "}
                      <span className="ml-4 font-medium">Qty:</span> {product.quantity || 1}
                    </p>
                    <p className="text-xs text-gray-900 font-semibold mt-2 uppercase">
                      ESTIMATED SHIPPING DATE: {product.shippingDate || "4TH OF NOVEMBER"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 text-right">
                  <p className="font-semibold text-gray-900 text-xl">
                    ₹{((product.price || 0) * (product.quantity || 1)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No products in this order</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
