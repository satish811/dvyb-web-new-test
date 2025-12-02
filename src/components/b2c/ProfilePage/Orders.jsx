import React, { useState, useEffect } from "react";
import OrderDetails from "./OrderDetails";
import { SlidersHorizontal, X } from "lucide-react";
import empty_ordersIc from "../../../assets/ProfileImages/empty_ordersIc.svg";
import orderService from "../../../services/orderService";
import InvoiceView from "./InvoiceView";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Last Week");
  const [showInvoice, setShowInvoice] = useState(false);

  const tabs = ["Active", "Delivered", "Cancelled", "Returned"];
  const filterOptions = [
    "Last Week",
    "Last Month",
    "Last 3 Months",
    "Last 6 Months",
    "2025",
    "2024",
  ];

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

  // Filter by date
  const filterOrdersByDate = (ordersList, filter) => {
    if (!filter || filter === "All Time") return ordersList;
    const now = new Date();

    return ordersList.filter((order) => {
      const orderDate = order.date?.toDate?.() || new Date(order.date || order.createdAt);
      if (isNaN(orderDate)) return false;

      switch (filter) {
        case "Last Week":
          return orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "Last Month":
          return orderDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "Last 3 Months":
          return orderDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case "Last 6 Months":
          return orderDate >= new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        case "2025":
          return orderDate.getFullYear() === 2025;
        case "2024":
          return orderDate.getFullYear() === 2024;
        default:
          return true;
      }
    });
  };

  // Final filtered orders
  const getFilteredOrders = () => {
    let filtered = orders.filter((order) => order.status === activeTab);
    filtered = filterOrdersByDate(filtered, selectedFilter);
    return filtered;
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

  const handleApplyFilter = () => {
    setShowFilter(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "text-green-600";
      case "Cancelled":
      case "Returned":
        return "text-red-600";
      default:
        return "text-orange-600";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date.toDate?.() || new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  // Order Card Component
  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* Desktop Header */}
      <div className="hidden md:flex bg-gray-50 p-6 justify-between items-start">
        <div>
          <h3 className={`text-lg font-bold ${getStatusColor(order.status)}`}>
            Order #{order.orderId || order.id}
          </h3>
          <p className="text-sm text-gray-600 mt-2">Placed on {formatDate(order.date)}</p>
          {order.estimatedDelivery && (
            <p className="text-sm text-gray-600">Est. Delivery: {order.estimatedDelivery}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{order.status}</p>
          <p className="text-sm text-gray-600">{order.paymentMethod || "COD"}</p>
        </div>
      </div>

      {/* Products List */}
      <div className="p-6">
        {order.products?.map((prod, i) => (
          <div key={i} className="flex gap-6 mb-6 last:mb-0 pb-6 last:pb-0 border-b last:border-0">
            <img
              src={prod.image || prod.imageUrls?.[0] || "https://via.placeholder.com/120"}
              alt={prod.name}
              className="w-28 h-36 object-cover rounded-md"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 uppercase text-sm mb-1">{prod.name}</h4>
              <p className="text-sm text-gray-600 mb-3">₹{(prod.price || 0).toLocaleString()}</p>
              <div className="flex gap-8 text-sm text-gray-600">
                {prod.size && (
                  <span>
                    Size: <strong>{prod.size}</strong>
                  </span>
                )}
                <span>
                  Qty: <strong>{prod.quantity || 1}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile Header */}
        <div className="md:hidden mb-4 pt-2 border-t border-gray-200">
          <h3 className={`text-lg font-bold ${getStatusColor(order.status)}`}>
            Order #{order.orderId || order.id}
          </h3>
          <p className="text-sm text-gray-600">Placed on {formatDate(order.date)}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {order.status === "Active" && (
            <button
              onClick={() => handleCancelOrder(order)}
              className="flex-1 md:flex-initial bg-gray-100 hover:bg-gray-200 px-6 py-3 text-sm font-medium uppercase rounded-md transition"
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={() => setSelectedOrder(order)}
            className="flex-1 md:flex-initial bg-[#800000] hover:bg-[#660000] text-white px-6 py-3 text-sm font-medium uppercase rounded-md transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <img src={empty_ordersIc} alt="No orders" className="w-64 h-64 object-contain mb-8" />
      <p className="text-xl font-medium text-gray-800">{message}</p>
      <p className="text-gray-600 mt-2">Your orders will appear here once placed.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">
            {displayOrders.length} order{displayOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-gray-900 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#800000]" />
                )}
              </button>
            ))}
            <button
              onClick={() => setShowFilter(true)}
              className="px-6 flex items-center gap-2 border-l border-gray-200 hover:bg-gray-50 transition"
            >
              <SlidersHorizontal size={18} />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        {displayOrders.length > 0 ? (
          displayOrders.map((order) => <OrderCard key={order.id || order.orderId} order={order} />)
        ) : (
          <EmptyState
            message={
              activeTab === "Active"
                ? "No active orders"
                : activeTab === "Delivered"
                  ? "No delivered orders yet"
                  : activeTab === "Cancelled"
                    ? "No cancelled orders"
                    : "No returned orders"
            }
          />
        )}

        {/* Filter Modal */}
        {showFilter && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowFilter(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-white rounded-lg shadow-xl p-6 w-80 pointer-events-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filter by Date</h3>
                  <button onClick={() => setShowFilter(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-3">
                  {filterOptions.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="filter"
                        value={option}
                        checked={selectedFilter === option}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="w-4 h-4 text-[#800000]"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleApplyFilter}
                  className="mt-6 w-full bg-[#800000] hover:bg-[#660000] text-white py-3 rounded-md font-medium"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
