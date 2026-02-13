import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import OrderDetails from "./OrderDetails";
import { SlidersHorizontal, X, ArrowRight } from "lucide-react";
import empty_ordersIc from "../../../assets/ProfileImages/empty_ordersIc.svg";
import orderService from "../../../services/orderService";
import InvoiceView from "./InvoiceView";

// Portal Component for Filter Modal
const FilterModalPortal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal Content - relative to ensure it sits on top of overlay */}
      <div className="relative z-[10000] w-full max-w-lg">
        {children}
      </div>
    </div>,
    document.body
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL ORDERS"); // Default to ALL
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    paymentMethod: "All",
    priceRange: "All",
    dateRange: "All"
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const [showInvoice, setShowInvoice] = useState(false);

  // Tabs based on mockup
  const tabs = ["ALL ORDERS", "ACTIVE", "DELIVERED", "CANCELLED", "RETURNED"];

  const filterOptions = {
    payment: ["Credit Card", "Debit Card", "Net Banking", "UPI", "Cash on Delivery"],
    price: ["All", "Under ₹50,000", "₹50,000 - ₹100,000", "Above ₹100,000"],
    date: ["All", "Last 30 Days", "Last 90 Days", "Last 180 Days"]
  };

  // Subscribe to real-time orders
  useEffect(() => {
    let unsubscribe = null;

    const setupSubscription = async () => {
      try {
        unsubscribe = await orderService.subscribeToOrders((fetchedOrders) => {
          setOrders(fetchedOrders || []);
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error setting up orders subscription:", error);
        setIsLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Filter Logic
  const getFilteredOrders = () => {
    let filtered = orders;

    // 1. Tab Filter (Status)
    if (activeTab !== "ALL ORDERS") {
      const statusMap = {
        "ACTIVE": "Active",
        "DELIVERED": "Delivered",
        "CANCELLED": "Cancelled",
        "RETURNED": "Returned"
      };
      const targetStatus = statusMap[activeTab];
      filtered = filtered.filter((order) => order.status === targetStatus);
    }

    // 2. Payment Method Filter
    // Note: Ensure your order object has 'paymentMethod' field. If not, this might need adjustment.
    if (filters.paymentMethod !== "All" && filters.paymentMethod) {
      // This is a placeholder check. Adjust property name based on your actual data structure (e.g., order.paymentDetails?.method)
      filtered = filtered.filter(order =>
        order.paymentMethod === filters.paymentMethod ||
        order.paymentType === filters.paymentMethod
      );
    }

    // 3. Price Range Filter
    if (filters.priceRange !== "All") {
      filtered = filtered.filter(order => {
        const total = order.total || order.amount || 0;
        switch (filters.priceRange) {
          case "Under ₹50,000": return total < 50000;
          case "₹50,000 - ₹100,000": return total >= 50000 && total <= 100000;
          case "Above ₹100,000": return total > 100000;
          default: return true;
        }
      });
    }

    // 4. Date Range Filter
    if (filters.dateRange !== "All") {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = order.date?.toDate?.() || new Date(order.date || order.createdAt);
        if (isNaN(orderDate)) return false;

        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case "Last 30 Days": return diffDays <= 30;
          case "Last 90 Days": return diffDays <= 90;
          case "Last 180 Days": return diffDays <= 180;
          default: return true;
        }
      });
    }

    return filtered || [];
  };

  const displayOrders = getFilteredOrders();

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Cancel Order #${order.orderId || order.id}?`)) return;

    try {
      await orderService.updateOrderStatus(order.id || order.orderId, "Cancelled");
      alert("Order cancelled successfully!");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Failed to cancel order.");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedOrder(null);
  };

  const openFilterModal = () => {
    setTempFilters({ ...filters }); // Reset temp to current applied
    setShowFilter(true);
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setShowFilter(false);
  };

  const clearFilters = () => {
    const reset = { paymentMethod: "All", priceRange: "All", dateRange: "All" };
    setFilters(reset);
    setTempFilters(reset);
    setShowFilter(false); // Optional: close or keep open
  };

  // Helper for Status Badge Styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active': return "border-yellow-400 text-yellow-600";
      case 'Delivered': return "border-green-500 text-green-600";
      case 'Cancelled': return "border-red-400 text-red-500";
      case 'Returned': return "border-orange-400 text-orange-500";
      default: return "border-gray-300 text-gray-500";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date.toDate?.() || new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Early Returns
  if (showInvoice && selectedOrder) {
    return <InvoiceView order={selectedOrder} onBack={() => setShowInvoice(false)} />;
  }

  if (selectedOrder && !showInvoice) {
    return (
      <OrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onDownloadInvoice={() => setShowInvoice(true)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-[Outfit]">
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  // --- ORDER CARD COMPONENT ---
  const OrderCard = ({ order }) => {
    const totalAmount = order.total || order.amount || 0;

    return (
      <div className="bg-white border border-gray-200 mb-6 font-[Outfit] shadow-sm hover:shadow-md transition-all">
        {/* 1. Header Section */}
        <div className="bg-gray-50 p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-[#33022F] text-base">Order no: #{order.orderId || order.id}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${getStatusBadgeStyle(order.status)} rounded tracking-wider`}>
                {order.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>Placed on {formatDate(order.date)}</p>
              <p>Estimated Delivery Date: {formatDate(order.estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000))}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Total:</p>
            <p className="text-xl font-bold text-[#33022F]">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* 2. Body Section (Product List) */}
        <div className="p-4 sm:p-6">
          {order.products?.map((prod, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-6 mb-6 last:mb-0 items-start">
              {/* Product Image */}
              <div className="w-24 h-32 bg-gray-100 shrink-0 overflow-hidden">
                <img
                  src={prod.image || prod.imageUrls?.[0] || "https://via.placeholder.com/150"}
                  alt={prod.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Product Details & Actions */}
              <div className="flex-1 w-full flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#33022F] uppercase text-sm mb-1">{prod.brand || "VILLY FASHION"}</h3>
                  <p className="text-sm text-gray-800 font-medium mb-1">{prod.name}</p>
                  <p className="text-base font-bold text-[#33022F] mb-3">₹{(prod.price || 0).toLocaleString()}</p>

                  <div className="flex items-center gap-6 text-xs text-black font-medium uppercase tracking-wide">
                    {prod.size && <span>Size : {prod.size}</span>}
                    <span>Qty : {prod.quantity || 1}</span>
                  </div>

                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-4 tracking-widest">
                    ESTIMATED SHIPPING DATE : {formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)).toUpperCase()}
                  </p>
                </div>

                {/* Action Buttons (Right Aligned in Desktop) */}
                <div className="flex flex-row sm:flex-col gap-3 sm:items-end mt-2 sm:mt-0">
                  {order.status === 'Active' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancelOrder(order); }}
                      className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition w-full sm:w-auto"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-6 py-2.5 bg-[#33022F] text-white text-sm font-medium hover:bg-[#5a0452] transition w-full sm:w-auto"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300 font-[Outfit]">
      <img src={empty_ordersIc} alt="No orders" className="w-64 h-64 object-contain mb-8" />
      <p className="text-xl font-medium text-gray-800">{message}</p>
      <p className="text-gray-600 mt-2">Your orders will appear here once placed.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white md:bg-gray-50/50 font-[Outfit]">
      <div className="max-w-6xl mx-auto p-4 lg:p-0">

        {/* Header & Filter */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#33022F]">My Orders</h1>
            <p className="text-gray-500 mt-1">{displayOrders.length} orders</p>
          </div>

          <button
            onClick={openFilterModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#33022F] text-[#33022F] hover:bg-[#33022F] hover:text-white transition rounded font-medium text-sm"
          >
            <SlidersHorizontal size={16} />
            <span>Filter Orders</span>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar gap-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-4 text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${activeTab === tab
                ? "text-[#33022F] border-[#33022F]"
                : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {displayOrders.length > 0 ? (
          displayOrders.map((order) => <OrderCard key={order.id || order.orderId} order={order} />)
        ) : (
          <EmptyState
            message={
              activeTab === "ACTIVE"
                ? "No active orders"
                : activeTab === "DELIVERED"
                  ? "No delivered orders yet"
                  : activeTab === "CANCELLED"
                    ? "No cancelled orders"
                    : activeTab === "RETURNED"
                      ? "No returned orders"
                      : "No orders found"
            }
          />
        )}

        {/* --- FILTER MODAL PORTAL --- */}
        <FilterModalPortal isOpen={showFilter} onClose={() => setShowFilter(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#33022F]">Filter Orders</h3>
              <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-8">

              {/* Payment Method */}
              <div>
                <h4 className="text-[#33022F] font-bold text-sm mb-4">Payment Method</h4>
                <div className="space-y-3">
                  {filterOptions.payment.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${tempFilters.paymentMethod === option ? "border-[#33022F]" : "border-gray-300"}`}>
                        {tempFilters.paymentMethod === option && <div className="w-3 h-3 rounded-full bg-[#33022F]" />}
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option}
                        checked={tempFilters.paymentMethod === option}
                        onChange={() => setTempFilters({ ...tempFilters, paymentMethod: option })}
                        className="hidden"
                      />
                      <span className="text-gray-600 text-sm font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-[#33022F] font-bold text-sm mb-4">Price Range</h4>
                <div className="space-y-3">
                  {filterOptions.price.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${tempFilters.priceRange === option ? "border-[#33022F]" : "border-gray-300"}`}>
                        {tempFilters.priceRange === option && <div className="w-3 h-3 rounded-full bg-[#33022F]" />}
                      </div>
                      <input
                        type="radio"
                        name="priceRange"
                        value={option}
                        checked={tempFilters.priceRange === option}
                        onChange={() => setTempFilters({ ...tempFilters, priceRange: option })}
                        className="hidden"
                      />
                      <span className="text-gray-600 text-sm font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h4 className="text-[#33022F] font-bold text-sm mb-4">Date Range</h4>
                <div className="space-y-3">
                  {filterOptions.date.map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${tempFilters.dateRange === option ? "border-[#33022F]" : "border-gray-300"}`}>
                        {tempFilters.dateRange === option && <div className="w-3 h-3 rounded-full bg-[#33022F]" />}
                      </div>
                      <input
                        type="radio"
                        name="dateRange"
                        value={option}
                        checked={tempFilters.dateRange === option}
                        onChange={() => setTempFilters({ ...tempFilters, dateRange: option })}
                        className="hidden"
                      />
                      <span className="text-gray-600 text-sm font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-6 flex gap-4">
              <button
                onClick={clearFilters}
                className="flex-1 border border-[#33022F] text-[#33022F] py-3 rounded font-bold text-sm uppercase tracking-wide hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-[#33022F] text-white py-3 rounded font-bold text-sm uppercase tracking-wide hover:bg-[#5a0452] transition shadow-lg"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </FilterModalPortal>
      </div>
    </div>
  );
};

export default MyOrders;
